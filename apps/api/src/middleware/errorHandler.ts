import { Request, Response, NextFunction } from 'express';
import logger, { log } from '../utils/logger';
import chalk from 'chalk';

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Clean error logging (no messy stack traces in terminal)
    const errorMsg = err.message || 'Unknown error';
    const location = `${req.method} ${req.path}`;

    // Detect Prisma database errors and show clean message
    const isPrismaError = errorMsg.includes('Prisma') || errorMsg.includes('does not exist in the current database');

    if (isPrismaError) {
        console.log(chalk.red(`✖ Database Error`));
        console.log(chalk.gray(`  ${errorMsg.split('\n')[0]}`)); // First line only
        console.log(chalk.yellow(`  → Run: npm run db:push to sync database`));
    } else {
        // Log clean error message
        console.log(chalk.red(`✖ Error: ${errorMsg.split('\n')[0]}`)); // First line only
        console.log(chalk.gray(`  at ${location}`));
    }

    // Full details only in dev with DEBUG env
    if (process.env.DEBUG) {
        logger.error('Full error details', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method
        });
    }

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

