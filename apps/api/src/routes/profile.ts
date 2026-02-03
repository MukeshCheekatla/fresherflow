import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { educationSchema, preferencesSchema, readinessSchema } from '../utils/validation';
import { AppError } from '../middleware/errorHandler';
import { calculateCompletion } from '../utils/profileCompletion';

const router: Router = express.Router();
const prisma = new PrismaClient();

// GET /api/profile
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profile = await prisma.profile.findUnique({
            where: { userId: req.userId }
        });

        if (!profile) {
            return next(new AppError('Profile not found', 404));
        }

        res.json({ profile });
    } catch (error) {
        next(error);
    }
});

// PUT /api/profile - Comprehensive update
router.put('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;

        // Update profile
        let profile = await prisma.profile.update({
            where: { userId: req.userId },
            data: {
                educationLevel: data.educationLevel,
                tenthYear: data.tenthYear,
                twelfthYear: data.twelfthYear,
                gradCourse: data.gradCourse,
                gradSpecialization: data.gradSpecialization,
                gradYear: data.gradYear,
                pgCourse: data.pgCourse,
                pgSpecialization: data.pgSpecialization,
                pgYear: data.pgYear,
                interestedIn: data.interestedIn,
                preferredCities: data.preferredCities,
                workModes: data.workModes,
                availability: data.availability,
                skills: data.skills
            }
        });

        // Recalculate completion percentage
        const newCompletion = calculateCompletion(profile);
        profile = await prisma.profile.update({
            where: { userId: req.userId },
            data: { completionPercentage: newCompletion }
        });

        res.json({
            profile,
            message: `Profile synchronized. Completion: ${newCompletion}%`
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/profile/education (40% weight)
router.put('/education', requireAuth, validate(educationSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            educationLevel,
            tenthYear,
            twelfthYear,
            gradCourse, gradSpecialization, gradYear,
            pgCourse, pgSpecialization, pgYear
        } = req.body;

        // Update profile
        let profile = await prisma.profile.update({
            where: { userId: req.userId },
            data: {
                educationLevel,
                tenthYear,
                twelfthYear,
                gradCourse,
                gradSpecialization,
                gradYear,
                pgCourse,
                pgSpecialization,
                pgYear
            }
        });

        // Recalculate completion percentage (DERIVED FIELD)
        const newCompletion = calculateCompletion(profile);
        profile = await prisma.profile.update({
            where: { userId: req.userId },
            data: { completionPercentage: newCompletion }
        });

        res.json({
            profile,
            message: `Profile updated. Completion: ${newCompletion}%`
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/profile/preferences (40% weight)
router.put('/preferences', requireAuth, validate(preferencesSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { interestedIn, preferredCities, workModes } = req.body;

        // Validate max 5 cities
        if (preferredCities.length > 5) {
            return next(new AppError('Maximum 5 cities allowed', 400));
        }

        let profile = await prisma.profile.update({
            where: { userId: req.userId },
            data: {
                interestedIn,
                preferredCities,
                workModes
            }
        });

        // Recalculate completion
        const newCompletion = calculateCompletion(profile);
        profile = await prisma.profile.update({
            where: { userId: req.userId },
            data: { completionPercentage: newCompletion }
        });

        res.json({
            profile,
            message: `Profile updated. Completion: ${newCompletion}%`
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/profile/readiness (20% weight)
router.put('/readiness', requireAuth, validate(readinessSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { availability, skills } = req.body;

        let profile = await prisma.profile.update({
            where: { userId: req.userId },
            data: {
                availability,
                skills
            }
        });

        // Recalculate completion
        const newCompletion = calculateCompletion(profile);
        profile = await prisma.profile.update({
            where: { userId: req.userId },
            data: { completionPercentage: newCompletion }
        });

        res.json({
            profile,
            message: `Profile updated. Completion: ${newCompletion}%`
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/profile/completion
router.get('/completion', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profile = await prisma.profile.findUnique({
            where: { userId: req.userId }
        });

        if (!profile) {
            return next(new AppError('Profile not found', 404));
        }

        res.json({
            completionPercentage: profile.completionPercentage,
            isComplete: profile.completionPercentage === 100
        });
    } catch (error) {
        next(error);
    }
});

export default router;

