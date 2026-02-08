import express, { NextFunction, Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import { alertPreferencesSchema } from '../utils/validation';

const router: Router = express.Router();
const prisma = new PrismaClient();

router.get('/preferences', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) return next(new AppError('Unauthorized', 401));

        const preference = await prisma.alertPreference.upsert({
            where: { userId },
            update: {},
            create: { userId },
        });

        res.json({ preference });
    } catch (error) {
        next(error);
    }
});

router.put('/preferences', requireAuth, validate(alertPreferencesSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) return next(new AppError('Unauthorized', 401));

        const preference = await prisma.alertPreference.upsert({
            where: { userId },
            create: {
                userId,
                ...req.body,
            },
            update: req.body,
        });

        res.json({ preference });
    } catch (error) {
        next(error);
    }
});

export default router;
