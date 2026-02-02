import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyAdminToken } from '../utils/jwt';
import { AppError } from './errorHandler';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            adminId?: string;
        }
    }
}

// User Authentication Middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('No token provided', 401));
    }

    const token = authHeader.substring(7);
    const userId = verifyAccessToken(token);

    if (!userId) {
        return next(new AppError('Invalid or expired token', 401));
    }

    req.userId = userId;
    next();
}

// Admin Authentication Middleware (Completely Separate)
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('No token provided', 401));
    }

    const token = authHeader.substring(7);
    const adminId = verifyAdminToken(token);

    if (!adminId) {
        return next(new AppError('Invalid admin token', 403));
    }

    req.adminId = adminId;
    next();
}
