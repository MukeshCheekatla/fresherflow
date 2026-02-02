import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from './errorHandler';
import { isProfileComplete } from '../utils/profileCompletion';

const prisma = new PrismaClient();

/**
 * Profile Gating Middleware
 * Blocks access to feed/dashboard/actions if profile completion < 100%
 */
export async function profileGate(req: Request, res: Response, next: NextFunction) {
    if (!req.userId) {
        return next(new AppError('Unauthorized', 401));
    }

    try {
        const profile = await prisma.profile.findUnique({
            where: { userId: req.userId }
        });

        if (!profile) {
            return next(new AppError('Profile not found. Please complete your profile.', 403));
        }

        if (!isProfileComplete(profile)) {
            return res.status(403).json({
                error: 'Complete your profile to access this feature',
                completionPercentage: profile.completionPercentage,
                requiredCompletion: 100
            });
        }

        next();
    } catch (error: any) {
        // Explicitly mask database connection errors early
        if (error.message?.toLowerCase().includes('prisma') || error.message?.toLowerCase().includes('neon')) {
            return next(new AppError('Database connection issue. Please try again later.', 503));
        }
        next(error);
    }
}
