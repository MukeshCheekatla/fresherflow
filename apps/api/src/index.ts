import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
// import * as Sentry from '@sentry/node'; // Disabled for first run
import { requestIdMiddleware } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';
import httpLogger from './middleware/httpLogger';
import { startExpiryCron } from './cron/expiryCron';

// Import routes
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import opportunitiesRoutes from './routes/opportunities';
import actionsRoutes from './routes/actions';
import feedbackRoutes from './routes/feedback';
import adminAuthRoutes from './routes/admin/auth';
import adminOpportunitiesRoutes from './routes/admin/opportunities';
import adminFeedbackRoutes from './routes/admin/feedback';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// Sentry Error Monitoring (Disabled for first run)
// ============================================================================
// if (process.env.SENTRY_DSN) {
//     Sentry.init({
//         dsn: process.env.SENTRY_DSN,
//         environment: process.env.NODE_ENV || 'development',
//         tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
//         integrations: [
//             new Sentry.Integrations.Http({ tracing: true }),
//         ],
//     });
//     app.use(Sentry.Handlers.requestHandler());
//     app.use(Sentry.Handlers.tracingHandler());
// }

// ============================================================================
// Middleware Setup
// ============================================================================

// Request ID (must be first for logging)
app.use(requestIdMiddleware);

// HTTP Request Logging (colorful!)
app.use(httpLogger);

// Security
app.use(helmet());

// CORS - Hardened for production
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting - Stricter on auth routes
const defaultLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            requestId: req.requestId
        });
        res.status(429).json({
            error: {
                message: 'Too many requests, please try again later',
                requestId: req.requestId
            }
        });
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 login attempts per window (increased for testing)
    skipSuccessfulRequests: true
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3 // 3 registrations per hour
});

// Apply default rate limiting
app.use(defaultLimiter);

// ============================================================================
// Routes
// ============================================================================

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// User routes
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/opportunities', feedbackRoutes);

// Admin routes (isolated)
app.use('/api/admin/auth/login', authLimiter);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/opportunities', adminOpportunitiesRoutes);
app.use('/api/admin/feedback', adminFeedbackRoutes);

// ============================================================================
// Error Handling
// ============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Route not found',
            path: req.path,
            requestId: req.requestId
        }
    });
});

// Sentry error handler (disabled for first run)
// if (process.env.SENTRY_DSN) {
//     app.use(Sentry.Handlers.errorHandler());
// }

// Central error handler (must be last)
app.use(errorHandler);

// ============================================================================
// Server Start
// ============================================================================

app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    logger.info(`🔍 Sentry: ${process.env.SENTRY_DSN ? 'Enabled' : 'Disabled'}`);

    // Start cron jobs
    startExpiryCron();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
    // if (process.env.SENTRY_DSN) {
    //     Sentry.captureException(reason);
    // }
});

export default app;

