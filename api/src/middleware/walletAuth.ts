import { Request, Response, NextFunction } from 'express';
import { Connection } from '@solana/web3.js';
import { config } from '../config';
import { verifyWalletSignature, verifySignatureNonce, generateSignatureNonce } from '../utils/walletSignature';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request to include wallet info
declare global {
  namespace Express {
    interface Request {
      walletAddress?: string;
      walletPublicKey?: string;
    }
  }
}

interface WalletAuthOptions {
  /** Whether to require wallet signature verification */
  requireSignature?: boolean;
  /** Optional nonce for the authentication request */
  nonce?: string;
  /** Skip authentication for certain paths */
  skipPaths?: string[];
}

/**
 * Middleware to verify wallet ownership via signature
 * @param options - Authentication options
 */
export function walletAuthMiddleware(options: WalletAuthOptions = {}) {
  const { requireSignature = true, skipPaths = [] } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip authentication for certain paths
    if (skipPaths.some(path => req.path.startsWith(path))) {
      next();
      return;
    }

    // Extract wallet address and signature from headers
    const walletAddress = req.headers['x-wallet-address'] as string;
    const signature = req.headers['x-wallet-signature'] as string;
    const message = req.headers['x-wallet-message'] as string;

    if (!walletAddress) {
      res.status(401).json({
        success: false,
        error: 'Wallet address required',
        code: 'MISSING_WALLET_ADDRESS'
      });
      return;
    }

    // For GET requests, signature may not be required
    if (!requireSignature || req.method === 'GET') {
      req.walletAddress = walletAddress;
      next();
      return;
    }

    if (!signature || !message) {
      res.status(401).json({
        success: false,
        error: 'Wallet signature required for this operation',
        code: 'MISSING_SIGNATURE'
      });
      return;
    }

    try {
      // Create RPC connection
      const connection = new Connection(config.solana.rpcUrl, 'confirmed');

      // Verify the signature
      const verificationResult = await verifyWalletSignature(
        connection,
        walletAddress,
        message,
        signature
      );

      if (!verificationResult.valid) {
        res.status(401).json({
          success: false,
          error: `Invalid wallet signature: ${verificationResult.error}`,
          code: 'INVALID_SIGNATURE'
        });
        return;
      }

      // Verify nonce if provided
      if (options.nonce) {
        const nonceResult = verifySignatureNonce(options.nonce, walletAddress);
        if (!nonceResult.valid) {
          res.status(401).json({
            success: false,
            error: `Invalid nonce: ${nonceResult.error}`,
            code: 'INVALID_NONCE'
          });
          return;
        }
      }

      // Verify wallet exists in database
      const user = await prisma.users.findUnique({
        where: { walletAddress }
      });

      if (!user) {
        // Optionally auto-register or reject
        res.status(401).json({
          success: false,
          error: 'Wallet not registered',
          code: 'WALLET_NOT_REGISTERED'
        });
        return;
      }

      // Attach wallet info to request
      req.walletAddress = walletAddress;
      req.walletPublicKey = walletAddress;

      next();
    } catch (error) {
      console.error('Wallet authentication error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication verification failed',
        code: 'AUTH_ERROR'
      });
    }
  };
}

/**
 * Middleware to require admin privileges
 * Must be used after walletAuthMiddleware
 */
export function adminOnlyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const adminWallets = config.platform.authority
    ? [config.platform.authority]
    : [];

  if (!req.walletAddress) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'NOT_AUTHENTICATED'
    });
    return;
  }

  if (!adminWallets.includes(req.walletAddress)) {
    res.status(403).json({
      success: false,
      error: 'Admin privileges required',
      code: 'NOT_ADMIN'
    });
    return;
  }

  next();
}

/**
 * Generate authentication challenge for wallet
 * @param walletAddress - The wallet address requesting authentication
 * @returns Object with message, nonce, and expires at
 */
export function generateAuthChallenge(walletAddress: string): {
  message: string;
  nonce: string;
  expiresAt: Date;
} {
  const nonce = generateSignatureNonce(walletAddress);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const message = `CRE-Debt-Solana Authentication

Please sign this message to authenticate your wallet.

Wallet: ${walletAddress}
Nonce: ${nonce}
Expires: ${expiresAt.toISOString()}

This signature will be used to verify ownership of your wallet.`;

  return {
    message,
    nonce,
    expiresAt
  };
}
