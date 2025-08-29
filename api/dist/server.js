"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const properties_1 = __importDefault(require("./routes/properties"));
const borrowers_1 = __importDefault(require("./routes/borrowers"));
const loans_1 = __importDefault(require("./routes/loans"));
const platform_1 = __importDefault(require("./routes/platform"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const payments_1 = __importDefault(require("./routes/payments"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./middleware/logger");
const config_1 = require("./config");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.cors.origin,
    credentials: true
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimit.windowMs,
    max: config_1.config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, compression_1.default)());
app.use(logger_1.loggerMiddleware);
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config_1.config.nodeEnv,
        version: '1.0.0'
    });
});
app.use('/api/properties', properties_1.default);
app.use('/api/borrowers', borrowers_1.default);
app.use('/api/loans', loans_1.default);
app.use('/api/platform', platform_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/payments', payments_1.default);
if (config_1.config.apiDocs.enabled) {
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
                    url: config_1.config.apiBaseUrl,
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
    const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
    app.use(config_1.config.apiDocs.path, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
}
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.originalUrl} not found`
        }
    });
});
app.use(errorHandler_1.errorHandler);
const PORT = config_1.config.port;
app.listen(PORT, () => {
    const logger = require('./middleware/logger').logger;
    logger.info(`🚀 CRE-Debt-Solana API server running on port ${PORT}`);
    logger.info(`📚 API Documentation: ${config_1.config.apiBaseUrl}${config_1.config.apiDocs.path}`);
    logger.info(`🌍 Environment: ${config_1.config.nodeEnv}`);
    logger.info(`🔗 Solana Cluster: ${config_1.config.solana.cluster}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map