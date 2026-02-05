import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// In-memory store for rate limiting (per admin, per hour)
// In production, use Redis or similar distributed cache
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Admin Rate Limiting Middleware
 * Enforces 10 create/edit actions per admin per hour
 * 
 * Keyed by: adminId + hour window
 */
export function adminRateLimit(req: Request, res: Response, next: NextFunction) {
    if (!req.adminId) {
        return next(new AppError('Admin ID not found', 401));
    }

    const nowMs = Date.now();
    const currentHour = Math.floor(nowMs / (1000 * 60 * 60));
    const key = `${req.adminId}:${currentHour}`;

    const entry = rateLimitStore.get(key);

    if (!entry) {
        // First request in this hour
        rateLimitStore.set(key, {
            count: 1,
            resetAt: (currentHour + 1) * (1000 * 60 * 60)
        });
        return next();
    }

    // Check limit
    if (entry.count >= 100) {
        const resetIn = Math.ceil((entry.resetAt - nowMs) / (1000 * 60));
        return next(new AppError(
            `Rate limit exceeded. Maximum 100 operations per hour. Try again in ${resetIn} minutes.`,
            429
        ));
    }

    // Increment count
    entry.count += 1;
    rateLimitStore.set(key, entry);

    // Cleanup old entries (only keep current hour)
    for (const [storeKey, value] of rateLimitStore.entries()) {
        if (value.resetAt < nowMs) {
            rateLimitStore.delete(storeKey);
        }
    }

    next();
}

