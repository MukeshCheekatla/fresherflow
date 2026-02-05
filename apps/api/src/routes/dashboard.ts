import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, OpportunityStatus } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { profileGate } from '../middleware/profileGate';
import { filterOpportunitiesForUser } from '../domain/eligibility';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/dashboard/highlights
 * Return urgent and personalized updates for the user dashboard
 */
router.get('/highlights', requireAuth, profileGate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;

        // 1. Get user profile
        const profile = await prisma.profile.findUnique({
            where: { userId }
        });

        if (!profile) {
            return res.json({ highlights: [] }); // Profile should theoretically exist due to profileGate
        }

        // 2. Fetch potentials for highlights
        const now = new Date();
        const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        // Fetching "Closing Soon" opportunities
        const potentials = await prisma.opportunity.findMany({
            where: {
                status: OpportunityStatus.PUBLISHED,
                deletedAt: null,
                expiresAt: {
                    gt: now,
                    lt: fortyEightHoursFromNow
                }
            },
            include: {
                walkInDetails: true,
                actions: {
                    where: { userId }
                },
                savedBy: {
                    where: { userId }
                }
            },
            orderBy: {
                expiresAt: 'asc'
            },
            take: 10
        });

        // 3. Apply eligibility filtering
        const eligiblePotentials = filterOpportunitiesForUser(potentials as any, profile as any);

        // 4. Categorize for the UI
        const walkins = eligiblePotentials.filter(o => o.type === 'WALKIN');
        const others = eligiblePotentials.filter(o => o.type !== 'WALKIN');

        // 5. Fetch "New Opportunities" (less than 24h old)
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const newOpps = await prisma.opportunity.findMany({
            where: {
                status: OpportunityStatus.PUBLISHED,
                postedAt: { gt: twentyFourHoursAgo },
                deletedAt: null
            },
            orderBy: { postedAt: 'desc' },
            take: 5
        });
        const eligibleNew = filterOpportunitiesForUser(newOpps as any, profile as any);

        res.json({
            urgent: {
                walkins: walkins.slice(0, 3),
                others: others.slice(0, 3)
            },
            newlyAdded: eligibleNew.slice(0, 3)
        });
    } catch (error) {
        next(error);
    }
});

export default router;
