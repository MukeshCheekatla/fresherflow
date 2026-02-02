import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

// GET /api/admin/feedback - Get all feedback sorted by negative count
router.get('/', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get feedback with opportunity details
        const feedback = await prisma.listingFeedback.findMany({
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true
                    }
                },
                opportunity: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                        type: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Group by opportunity and count
        const feedbackByOpportunity = feedback.reduce((acc: any, item) => {
            const oppId = item.opportunityId;
            if (!acc[oppId]) {
                acc[oppId] = {
                    opportunity: item.opportunity,
                    feedbackCount: 0,
                    negativeCount: 0,
                    feedback: []
                };
            }
            acc[oppId].feedbackCount++;
            if (['EXPIRED', 'LINK_BROKEN', 'DUPLICATE'].includes(item.reason)) {
                acc[oppId].negativeCount++;
            }
            acc[oppId].feedback.push({
                id: item.id,
                reason: item.reason,
                createdAt: item.createdAt,
                user: item.user
            });
            return acc;
        }, {});

        // Sort by negative count
        const sorted = Object.values(feedbackByOpportunity).sort((a: any, b: any) =>
            b.negativeCount - a.negativeCount
        );

        res.json({ feedbackSummary: sorted });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/opportunities/:id/feedback
router.get('/opportunities/:id', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };

        const feedback = await prisma.listingFeedback.findMany({
            where: { opportunityId: id },
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
