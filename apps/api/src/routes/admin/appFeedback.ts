import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

// GET /api/admin/app-feedback - App-level feedback
router.get('/', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const feedback = await prisma.appFeedback.findMany({
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ feedback });
    } catch (error) {
        next(error);
    }
});

export default router;
