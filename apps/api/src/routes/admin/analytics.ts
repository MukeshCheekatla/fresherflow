import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, OpportunityStatus } from '@prisma/client';
import { requireAdmin } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/admin/analytics/overview
 * Platform-wide analytics for the admin dashboard
 */
router.get('/overview', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // 1. Link Health Distribution
        const linkHealthStats = await prisma.opportunity.groupBy({
            by: ['linkHealth'],
            _count: true,
            where: {
                status: OpportunityStatus.PUBLISHED,
                deletedAt: null
            }
        });

        const healthDistribution = {
            healthy: 0,
            broken: 0,
            retrying: 0
        };

        linkHealthStats.forEach(stat => {
            if (stat.linkHealth === 'HEALTHY') healthDistribution.healthy = stat._count;
            if (stat.linkHealth === 'BROKEN') healthDistribution.broken = stat._count;
            if (stat.linkHealth === 'RETRYING') healthDistribution.retrying = stat._count;
        });

        // 2. Opportunity Stats by Status
        const opportunityStats = await prisma.opportunity.groupBy({
            by: ['status'],
            _count: true,
            where: { deletedAt: null }
        });

        const statusDistribution = {
            published: 0,
            draft: 0,
            archived: 0
        };

        opportunityStats.forEach(stat => {
            if (stat.status === 'PUBLISHED') statusDistribution.published = stat._count;
            if (stat.status === 'DRAFT') statusDistribution.draft = stat._count;
            if (stat.status === 'ARCHIVED') statusDistribution.archived = stat._count;
        });

        // 3. Recent Activity (Last 30 days)
        const recentApplications = await prisma.userAction.count({
            where: {
                actionType: 'APPLIED',
                createdAt: { gte: thirtyDaysAgo }
            }
        });

        const recentUsers = await prisma.user.count({
            where: {
                createdAt: { gte: thirtyDaysAgo }
            }
        });

        // 4. Top Job Types (by application count)
        const topTypes = await prisma.opportunity.findMany({
            where: {
                status: OpportunityStatus.PUBLISHED,
                deletedAt: null
            },
            select: {
                type: true,
                _count: {
                    select: { actions: true }
                }
            },
            orderBy: {
                actions: { _count: 'desc' }
            },
            take: 10
        });

        const typeStats = await prisma.opportunity.groupBy({
            by: ['type'],
            _count: true,
            where: {
                status: OpportunityStatus.PUBLISHED,
                deletedAt: null
            }
        });

        // 5. Recent Bookmarks (Last 7 days)
        const recentBookmarks = await prisma.savedOpportunity.count({
            where: {
                createdAt: { gte: sevenDaysAgo }
            }
        });

        // 6. Feedback Summary
        const feedbackStats = await prisma.listingFeedback.groupBy({
            by: ['reason'],
            _count: true,
            where: {
                createdAt: { gte: thirtyDaysAgo }
            }
        });

        const feedbackDistribution: Record<string, number> = {};
        feedbackStats.forEach(stat => {
            feedbackDistribution[stat.reason] = stat._count;
        });

        // 7. Closing Soon Opportunities
        const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const closingSoonCount = await prisma.opportunity.count({
            where: {
                status: OpportunityStatus.PUBLISHED,
                deletedAt: null,
                expiresAt: {
                    gt: now,
                    lt: fortyEightHoursFromNow
                }
            }
        });

        res.json({
            linkHealth: healthDistribution,
            opportunityStatus: statusDistribution,
            activity: {
                applications30d: recentApplications,
                newUsers30d: recentUsers,
                bookmarks7d: recentBookmarks
            },
            typeDistribution: typeStats.map(t => ({ type: t.type, count: t._count })),
            feedback: feedbackDistribution,
            urgent: {
                closingSoon48h: closingSoonCount,
                brokenLinks: healthDistribution.broken
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/analytics/recent-activity
 * Recent user actions and registrations
 */
router.get('/recent-activity', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        const recentActions = await prisma.userAction.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { fullName: true, email: true }
                },
                opportunity: {
                    select: { title: true, company: true }
                }
            }
        });

        const recentUsers = await prisma.user.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                fullName: true,
                email: true,
                createdAt: true,
                profile: {
                    select: { completionPercentage: true }
                }
            }
        });

        res.json({
            actions: recentActions,
            users: recentUsers
        });
    } catch (error) {
        next(error);
    }
});

export default router;
