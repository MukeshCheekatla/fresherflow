import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, OpportunityStatus } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { profileGate } from '../middleware/profileGate';
import { AppError } from '../middleware/errorHandler';
import { filterOpportunitiesForUser, sortOpportunitiesWithWalkinsFirst } from '../domain/eligibility';

const router: Router = express.Router();
const prisma = new PrismaClient();

// GET /api/opportunities - Get filtered feed (DB + Code filtering)
router.get('/', requireAuth, profileGate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, category, city, closingSoon } = req.query;
        const filterType = (type || category) as string | undefined;

        // Get user profile for filtering
        const profile = await prisma.profile.findUnique({
            where: { userId: req.userId }
        });

        if (!profile || !profile.gradYear) {
            return next(new AppError('Profile incomplete', 400));
        }

        // Stage 1: DB-Level Filtering (Coarse)
        const dbFiltered = await prisma.opportunity.findMany({
            where: {
                status: OpportunityStatus.PUBLISHED,
                ...(filterType ? { type: filterType.toUpperCase() as any } : { type: { in: profile.interestedIn } }),
                ...(city ? {
                    locations: { has: city as string }
                } : {
                    locations: { hasSome: profile.preferredCities }
                }),
                allowedPassoutYears: { has: profile.gradYear }
            },
            include: {
                walkInDetails: true,
                admin: {
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
router.get('/:id', requireAuth, profileGate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };

        const opportunity = await prisma.opportunity.findUnique({
            where: { id },
            include: {
                walkInDetails: true,
                admin: {
                    select: {
                        fullName: true
                    }
                },
                actions: {
                    where: { userId: req.userId }
                }
            }
        });

        if (!opportunity) {
            return next(new AppError('Opportunity not found', 404));
        }

        // Check if user is eligible
        const profile = await prisma.profile.findUnique({
            where: { userId: req.userId }
        });

        if (!profile) {
            return next(new AppError('Profile not found', 404));
        }

        const eligible = filterOpportunitiesForUser([opportunity] as any, profile as any);
        if (eligible.length === 0) {
            return next(new AppError('You are not eligible for this opportunity', 403));
        }

        res.json({ opportunity });
    } catch (error) {
        next(error);
    }
});

export default router;

