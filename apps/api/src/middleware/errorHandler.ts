import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Log the full detailed error for server-side debugging
    logger.error('Unhandled error', {
        requestId: req.requestId,
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    const statusCode = err.statusCode || 500;
    const isDev = process.env.NODE_ENV === 'development';

    /**
     * SANITIZATION PROTOCOL
     * 1. Check if it's explicitly an AppError (customer-facing)
     * 2. Ensure the message doesn't contain technical markers (Prisma, Neon, AWS, invocation, etc.)
     */
    const technicalKeywords = /prisma|neon|aws|invocation|→|database|sql|server|connect/i;
    const isTechnical = technicalKeywords.test(err.message || '');
    const isOperational = (err.isAppError || err.isOperational) && !isTechnical;

    // Use the original message ONLY if it's operational AND not technical
    const message = isOperational
        ? err.message
        : 'A system error occurred. Please check your connection and try again.';

    res.status(statusCode).json({
        error: {
            message,
            requestId: req.requestId,
            // In dev, we still send technical info in separate fields for the console
            // but the 'message' field above is now guaranteed to be clean for toasts.
            ...(isDev && {
                _dev_info: {
                    originalError: err.message, // Use the original error message for dev info
                    isOperational,
                    type: err.name
                }
            })
        }
    });
}

// Custom error class
export class AppError extends Error {
    statusCode: number;
    isAppError: boolean;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
        this.isAppError = true;
        this.isOperational = true;
    }
}
