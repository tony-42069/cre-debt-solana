import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload as JsonWebTokenPayload } from 'jsonwebtoken';
import { config } from '../config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Type assertion helper for config values that might be undefined at runtime
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getJwtSecret = (): string => {
  const secret = config.jwt.secret;
  if (secret && secret.trim().length > 0) {
    return secret;
  }
  return 'fallback-secret';
};

// Extend Express Request to include auth info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        walletAddress: string;
        email?: string | null;
        role: string;
      };
    }
  }
}

interface CustomJwtPayload {
  walletAddress: string;
  role: string;
}

/**
 * JWT Authentication middleware
 * Validates JWT tokens for protected routes
 */
export async function jwtAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authorization token required',
      code: 'MISSING_TOKEN'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // @ts-expect-error - TypeScript strict null checks don't account for runtime config
    const decoded = jwt.verify(token, getJwtSecret()) as any as CustomJwtPayload;

    // Verify user exists in database
    const user = await prisma.users.findUnique({
      where: { walletAddress: decoded.walletAddress }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      walletAddress: user.walletAddress,
      email: user.email,
      role: 'user'
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    console.error('JWT authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
}

/**
 * Generate JWT token for a wallet
 * @param walletAddress - The wallet address
 * @param role - User role (default: 'user')
 * @returns JWT token
 */
export function generateToken(walletAddress: string, role: string = 'user'): string {
  const payload: CustomJwtPayload = {
    walletAddress,
    role
  };

  const expiresIn = config.jwt.expiresIn ?? '24h';

  const secret: string = (config.jwt.secret || 'fallback-secret') as string;
  return jwt.sign(payload as object, getJwtSecret(), {
    expiresIn: expiresIn
  } as any);
}

/**
 * Verify token without middleware
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): CustomJwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return decoded as CustomJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Rate limit by wallet address
 * Creates a rate limiter that tracks requests per wallet
 */
export function createWalletRateLimiter(windowMs: number, maxRequests: number) {
  const walletRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const walletAddress = req.walletAddress ?? req.headers['x-wallet-address'] as string;

    if (!walletAddress) {
      next();
      return;
    }

    const now = Date.now();
    const walletData = walletRequests.get(walletAddress);

    if (!walletData || now > walletData.resetTime) {
      // Reset or create new entry
      walletRequests.set(walletAddress, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }

    if (walletData.count >= maxRequests) {
      res.status(429).json({
        success: false,
        error: 'Too many requests from this wallet',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((walletData.resetTime - now) / 1000)
      });
      return;
    }

    walletData.count++;
    next();
  };
}

/**
 * Require specific roles
 * @param allowedRoles - Array of allowed roles
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_ROLE'
      });
      return;
    }

    next();
  };
}

/**
 * Optional authentication
 * Attaches user to request if valid token provided, but doesn't require it
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // @ts-expect-error - TypeScript strict null checks don't account for runtime config
    const decoded = jwt.verify(token, getJwtSecret()) as any as CustomJwtPayload;

    const user = await prisma.users.findUnique({
      where: { walletAddress: decoded.walletAddress }
    });

    if (user) {
      req.user = {
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        role: 'user'
      };
    }
  } catch {
    // Ignore token errors in optional auth
  }

  next();
}
