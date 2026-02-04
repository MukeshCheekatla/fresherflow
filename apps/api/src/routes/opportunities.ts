import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, OpportunityStatus } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { profileGate } from '../middleware/profileGate';
import { AppError } from '../middleware/errorHandler';
import { filterOpportunitiesForUser, sortOpportunitiesWithWalkinsFirst, checkEligibility } from '../domain/eligibility';
import { verifyAccessToken } from '@fresherflow/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

function normalizeTypeParam(raw?: string) {
    if (!raw) return undefined;
    const value = raw.toLowerCase();
    if (value === 'job' || value === 'jobs') return 'JOB';
    if (value === 'internship' || value === 'internships') return 'INTERNSHIP';
    if (value === 'walk-in' || value === 'walkin' || value === 'walkins' || value === 'walk-ins') return 'WALKIN';
    return raw.toUpperCase();
}

// GET /api/opportunities - Get filtered feed (DB + Code filtering)
router.get('/', requireAuth, profileGate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, category, city, closingSoon } = req.query;
        const filterType = normalizeTypeParam((type || category) as string | undefined);

        // Get user profile for filtering
        const profile = await prisma.profile.findUnique({
            where: { userId: req.userId }
        });

        if (!profile || !profile.gradYear) {
            return next(new AppError('Profile incomplete', 400));
        }

        // Stage 1: DB-Level Filtering (Coarse)
        // We only filter by status and type here. 
        // Strict matching for years/degrees is handled by the Eligibility Engine in Stage 2.
        const dbFiltered = await prisma.opportunity.findMany({
            where: {
                status: OpportunityStatus.PUBLISHED,
                ...(filterType ? { type: filterType.toUpperCase() as any } : {}),
                ...(city ? {
                    locations: { has: city as string }
                } : {}),
            },
            include: {
                walkInDetails: true,
                user: {
                    select: {
                        fullName: true
                    }
                },
                actions: {
                    where: { userId: req.userId }
                }
            }
        });

        // Stage 2: Code-Level Filtering (Fine)
        const codeFiltered = filterOpportunitiesForUser(dbFiltered as any, profile as any);

        // Sort with walk-ins first
        const sorted = sortOpportunitiesWithWalkinsFirst(codeFiltered);

        res.json({
            opportunities: sorted,
            count: sorted.length
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/opportunities/:id
// Publicly accessible route
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };

        // 1. Identify User (Optional Auth)
        const token = req.cookies.accessToken;
        const userId = token ? verifyAccessToken(token) : null;

        const opportunity = await prisma.opportunity.findUnique({
            where: { id },
            include: {
                walkInDetails: true,
                user: {
                    select: {
                        fullName: true
                    }
                },
                ...(userId ? {
                    actions: {
                        where: { userId }
                    }
                } : {})
            }
        });

        if (!opportunity) {
            return next(new AppError('Opportunity not found', 404));
        }

        // 2. Logic for Logged-in vs Guest
        let isEligible = true;
        let eligibilityReason: string | undefined;

        if (userId) {
            const profile = await prisma.profile.findUnique({
                where: { userId }
            });

            if (profile) {
                const result = checkEligibility(opportunity as any, profile as any, userId);
                isEligible = result.eligible;
                eligibilityReason = result.reason;
            }
        }

        res.json({
            opportunity,
            isEligible,
            eligibilityReason
        });
    } catch (error) {
        next(error);
    }
});

export default router;
