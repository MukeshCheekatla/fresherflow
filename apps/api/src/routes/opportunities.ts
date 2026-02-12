import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, OpportunityStatus } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { profileGate } from '../middleware/profileGate';
import { AppError } from '../middleware/errorHandler';
import { filterOpportunitiesForUser, rankOpportunitiesForUser, checkEligibility } from '../domain/eligibility';
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

// GET /api/opportunities - Get filtered// Reading file to check filter logicng)
router.get('/', requireAuth, profileGate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, category, city, company, closingSoon, relevanceDebug, minSalary, maxSalary } = req.query;
        const filterType = normalizeTypeParam((type || category) as string | undefined);
        const minSal = minSalary ? parseInt(minSalary as string) : undefined;
        const maxSal = maxSalary ? parseInt(maxSalary as string) : undefined;

        // Get user for role check
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { profile: true }
        });

        if (!user) return next(new AppError('User not found', 404));

        const isAdmin = user.role === 'ADMIN';
        const profile = user.profile;

        // Candidate Validation: Must have complete profile
        if (!isAdmin && (!profile || !profile.gradYear)) {
            return next(new AppError('Profile incomplete', 400));
        }

        // Stage 1: DB-Level Filtering (Coarse)
        const dbFiltered = await prisma.opportunity.findMany({
            where: {
                status: OpportunityStatus.PUBLISHED,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ],
                ...(filterType ? { type: filterType.toUpperCase() as any } : {}),
                ...(city ? {
                    locations: { has: city as string }
                } : {}),
                ...(company ? {
                    company: company as string
                } : {}),
                ...(minSal !== undefined ? {
                    OR: [
                        { salaryMin: { gte: minSal } },
                        { salaryMax: { gte: minSal } }
                    ]
                } : {}),
                ...(maxSal !== undefined ? {
                    salaryMin: { lte: maxSal }
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
                },
                savedBy: {
                    where: { userId: req.userId }
                }
            },
            orderBy: {
                postedAt: 'desc'
            }
        });

        // Map results to include isSaved flag
        const mappedResults = dbFiltered.map(opp => ({
            ...opp,
            isSaved: Boolean(opp.savedBy && opp.savedBy.length > 0)
        }));

        // Stage 2: Code-Level Filtering (Fine)
        // Admins see EVERYTHING returned by DB filter. Candidates see eligible only.
        let finalResults: any[] = mappedResults;

        if (!isAdmin && profile) {
            // Apply eligibility rules for candidates
            finalResults = filterOpportunitiesForUser(mappedResults as any, profile as any);
        }

        const includeRelevanceDebug = isAdmin && relevanceDebug === 'true' && Boolean(profile);
        let sorted = finalResults as any[];
        let debug: any[] | undefined;

        // Personalized relevance sort (fresher-friendly experience ordering included).
        if (profile) {
            const ranked = rankOpportunitiesForUser(finalResults as any, profile as any);
            sorted = ranked.map((item) => item.opportunity);

            if (includeRelevanceDebug) {
                debug = ranked.map((item) => ({
                    opportunityId: item.opportunity.id,
                    title: item.opportunity.title,
                    company: item.opportunity.company,
                    score: item.score,
                    breakdown: item.breakdown,
                }));
            }
        }

        res.json({
            opportunities: sorted,
            count: sorted.length,
            ...(includeRelevanceDebug ? { relevanceDebug: debug } : {})
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/opportunities/:id (supports both slug and ID)
// Publicly accessible route
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };

        // 1. Identify User (Optional Auth)
        const token = req.cookies.accessToken;
        const userId = token ? verifyAccessToken(token) : null;

        const extractSlugSuffix = (value: string) => {
            const parts = value.split('-').filter(Boolean);
            const last = parts[parts.length - 1] || '';
            return /^[a-f0-9]{6,12}$/i.test(last) ? last.toLowerCase() : '';
        };

        // Try finding by current slug first, then by full ID.
        let opportunity = await prisma.opportunity.findFirst({
            where: {
                OR: [
                    { slug: id },
                    { id: id }
                ]
            },
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
                    },
                    savedBy: {
                        where: { userId }
                    }
                } : {})
            }
        });

        // Backward-compatible slug resolution:
        // if title/company changed, slug changes; preserve old shared links by matching UUID suffix.
        if (!opportunity) {
            const suffix = extractSlugSuffix(id);
            if (suffix) {
                opportunity = await prisma.opportunity.findFirst({
                    where: {
                        id: { endsWith: suffix }
                    },
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
                            },
                            savedBy: {
                                where: { userId }
                            }
                        } : {})
                    }
                });
            }
        }

        if (!opportunity) {
            return next(new AppError('Opportunity not found', 404));
        }

        // Add isSaved flag
        const opportunityWithSaved = {
            ...opportunity,
            isSaved: Boolean((opportunity as any).savedBy && (opportunity as any).savedBy.length > 0)
        };

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
            opportunity: opportunityWithSaved,
            isEligible,
            eligibilityReason
        });
    } catch (error) {
        next(error);
    }
});

export default router;
