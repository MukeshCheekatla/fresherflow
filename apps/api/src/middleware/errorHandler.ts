import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    logger.error('Unhandled error', {
        requestId: req.requestId,
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method
    });

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        error: {
            message,
            requestId: req.requestId,
            // Never leak stack traces in production
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
}

// Custom error class
export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}
