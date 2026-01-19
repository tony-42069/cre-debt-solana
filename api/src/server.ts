import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import propertyRoutes from './routes/properties';
import borrowerRoutes from './routes/borrowers';
import loanRoutes from './routes/loans';
import platformRoutes from './routes/platform';
import dashboardRoutes from './routes/dashboard';
import paymentRoutes from './routes/payments';
import webhookRoutes from './routes/webhooks';

// Import services
import { healthCheckHandler, metricsHandler } from './services/monitoring';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { loggerMiddleware } from './middleware/logger';

// Import config
import { config } from './config';

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration with security enhancements
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Get allowed origins from config or environment
    const allowedOrigins = config.cors.origin
      ? [config.cors.origin]
      : ['http://localhost:3000', 'http://localhost:3001'];

    // In development, allow all localhost origins
    if (config.nodeEnv === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
        return;
      }
    }

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Wallet-Address', 'X-Wallet-Signature', 'X-Wallet-Message'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86400, // 24 hours
  preflightContinue: false
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(loggerMiddleware);

// Health check endpoint
app.get('/health', healthCheckHandler);
app.get('/health/live', (req, res) => res.status(200).json({ status: 'alive' }));
app.get('/health/ready', healthCheckHandler);
app.get('/metrics', metricsHandler);

// API routes
app.use('/api/properties', propertyRoutes);
app.use('/api/borrowers', borrowerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', webhookRoutes);

// Swagger documentation
if (config.apiDocs.enabled) {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'CRE-Debt-Solana API',
        version: '1.0.0',
        description: 'Backend API for CRE-Debt-Solana platform',
      },
      servers: [
        {
          url: config.apiBaseUrl,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/**/*.ts'],
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use(config.apiDocs.path, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Swagger JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  const logger = require('./middleware/logger').logger;
  logger.info(`🚀 CRE-Debt-Solana API server running on port ${PORT}`);
  logger.info(`📚 API Documentation: ${config.apiBaseUrl}${config.apiDocs.path}`);
  logger.info(`🌍 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Solana Cluster: ${config.solana.cluster}`);
});

export default app;
