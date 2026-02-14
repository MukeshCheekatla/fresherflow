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

router.get('/feed', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) return next(new AppError('Unauthorized', 401));

        const kindRaw = String(req.query.kind || 'all').toUpperCase();
        const limitRaw = Number(req.query.limit || 50);
        const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 50;

        const where: {
            userId: string;
            kind?: 'DAILY_DIGEST' | 'CLOSING_SOON' | 'HIGHLIGHT' | 'APP_UPDATE' | 'NEW_JOB';
        } = { userId };

        if (['DAILY_DIGEST', 'CLOSING_SOON', 'HIGHLIGHT', 'APP_UPDATE', 'NEW_JOB'].includes(kindRaw)) {
            where.kind = kindRaw as any;
        }

        const deliveries = await prisma.alertDelivery.findMany({
            where,
            orderBy: { sentAt: 'desc' },
            take: limit,
            include: {
                opportunity: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        company: true,
                        type: true,
                        expiresAt: true,
                    }
                }
            }
        });

        const summary = {
            total: deliveries.length,
            dailyDigest: deliveries.filter((item) => (item.kind as any) === 'DAILY_DIGEST').length,
            closingSoon: deliveries.filter((item) => (item.kind as any) === 'CLOSING_SOON').length,
            highlight: deliveries.filter((item) => (item.kind as any) === 'HIGHLIGHT').length,
            appUpdate: deliveries.filter((item) => (item.kind as any) === 'APP_UPDATE').length,
            newJob: deliveries.filter((item) => (item.kind as any) === 'NEW_JOB').length,
        };

        const unreadCount = await prisma.alertDelivery.count({
            where: { userId, readAt: null }
        });

        res.json({ deliveries, summary, unreadCount });
    } catch (error) {
        next(error);
    }
});

router.get('/unread-count', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) return next(new AppError('Unauthorized', 401));

        const count = await prisma.alertDelivery.count({
            where: {
                userId,
                readAt: null
            }
        });

        res.json({ count });
    } catch (error) {
        next(error);
    }
});

router.post('/mark-all-read', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) return next(new AppError('Unauthorized', 401));

        await prisma.alertDelivery.updateMany({
            where: {
                userId,
                readAt: null
            },
            data: {
                readAt: new Date()
            }
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.post('/:id/read', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        if (!userId) return next(new AppError('Unauthorized', 401));

        await prisma.alertDelivery.updateMany({
            where: {
                id: String(id),
                userId // Ensure user owns the alert
            },
            data: {
                readAt: new Date()
            }
        });

        res.json({ success: true });
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
