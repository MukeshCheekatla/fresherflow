import { Router, Request, Response, NextFunction } from 'express';
import { requireAdmin } from '../../middleware/auth';
import { runLinkVerification } from '../../services/verificationBot';
import { getObservabilityMetrics } from '../../middleware/observability';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Trigger Link Verification Bot
 * POST /api/admin/system/verify-links
 */
router.post('/verify-links', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const results = await runLinkVerification();
        res.json({
            success: true,
            message: 'Verification bot run complete.',
            ...results
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Get Health Statistics
 * GET /api/admin/system/health-stats
 */
router.get('/health-stats', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const counts = await prisma.opportunity.groupBy({
            by: ['linkHealth'],
            _count: true,
            where: {
                status: 'PUBLISHED',
                deletedAt: null
            }
        });

        const stats = {
            healthy: 0,
            broken: 0,
            retrying: 0
        };

        counts.forEach(c => {
            if (c.linkHealth === 'HEALTHY') stats.healthy = c._count;
            if (c.linkHealth === 'BROKEN') stats.broken = c._count;
            if (c.linkHealth === 'RETRYING') stats.retrying = c._count;
        });

        res.json({ stats });
    } catch (error) {
        next(error);
    }
});

/**
 * Get request observability metrics
 * GET /api/admin/system/metrics
 */
router.get('/metrics', requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const metrics = getObservabilityMetrics();
        res.json({ metrics });
    } catch (error) {
        next(error);
    }
});

export default router;
