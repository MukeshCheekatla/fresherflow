import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, AppFeedbackType } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { appFeedbackSchema } from '../utils/validation';

const router: Router = express.Router();
const prisma = new PrismaClient();

// POST /api/feedback - Submit product feedback
router.post('/', requireAuth, validate(appFeedbackSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, rating, message, pageUrl } = req.body as {
            type: AppFeedbackType;
            rating?: number;
            message: string;
            pageUrl?: string;
        };

        const feedback = await prisma.appFeedback.create({
            data: {
                userId: req.userId!,
                type,
                rating,
                message,
                pageUrl
            }
        });

        res.json({
            feedback,
            message: 'Feedback submitted successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
