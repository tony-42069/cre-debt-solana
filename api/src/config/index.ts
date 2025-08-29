import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  apiBaseUrl: string;
  database: {
    url: string;
  };
  solana: {
    rpcUrl: string;
    cluster: string;
  };
  programs: {
    propertyRegistry: string;
    loanCore: string;
    borrowerRegistry: string;
  };
  platform: {
    authority: string;
    treasury: string;
    tokenAccount: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  cors: {
    origin: string;
  };
  apiDocs: {
    enabled: boolean;
    path: string;
  };
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',

  database: {
    url: process.env.DATABASE_URL || '',
  },

  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    cluster: process.env.SOLANA_CLUSTER || 'devnet',
  },

  programs: {
    propertyRegistry: process.env.PROGRAM_ID_PROPERTY_REGISTRY || '',
    loanCore: process.env.PROGRAM_ID_LOAN_CORE || '',
    borrowerRegistry: process.env.PROGRAM_ID_BORROWER_REGISTRY || '',
  },

  platform: {
    authority: process.env.PLATFORM_AUTHORITY || '',
    treasury: process.env.PLATFORM_TREASURY || '',
    tokenAccount: process.env.PLATFORM_TOKEN_ACCOUNT || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  apiDocs: {
    enabled: process.env.API_DOCS_ENABLED === 'true',
    path: process.env.API_DOCS_PATH || '/api-docs',
  },
};

// Validate required configuration
const requiredEnvVars = [
  'DATABASE_URL',
  'PROGRAM_ID_PROPERTY_REGISTRY',
  'PROGRAM_ID_LOAN_CORE',
  'PROGRAM_ID_BORROWER_REGISTRY',
  'PLATFORM_AUTHORITY',
  'PLATFORM_TREASURY',
  'PLATFORM_TOKEN_ACCOUNT',
  'JWT_SECRET',
];

if (config.nodeEnv === 'production') {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export { config };
