import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, OpportunityStatus, OpportunityType } from '@prisma/client';
import { requireAdmin } from '../../middleware/auth';
import { adminRateLimit } from '../../middleware/adminRateLimit';
import { withAdminAudit, validateReason } from '../../middleware/adminAudit';
import { validate } from '../../middleware/validate';
import { opportunitySchema } from '../../utils/validation';
import { AppError } from '../../middleware/errorHandler';

const router: Router = express.Router();
const prisma = new PrismaClient();

// POST /api/admin/opportunities
router.post(
    '/',
    requireAdmin,
    adminRateLimit,
    withAdminAudit('CREATE'),
    validate(opportunitySchema as any),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;

            const opportunity = await prisma.opportunity.create({
                data: {
                    type: data.type,
                    title: data.title,
                    company: data.company,
                    description: data.description,
                    allowedDegrees: data.allowedDegrees,
                    allowedPassoutYears: data.allowedPassoutYears,
                    requiredSkills: data.requiredSkills || [],
                    locations: data.locations,
                    workMode: data.workMode,
                    salaryMin: data.salaryMin,
                    salaryMax: data.salaryMax,
                    applyLink: data.applyLink,
                    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                    postedByAdminId: req.adminId!,
                    ...(data.type === OpportunityType.WALKIN && data.walkInDetails && {
                        walkInDetails: {
                            create: {
                                dates: data.walkInDetails.dates?.map((d: string) => new Date(d)) || [],
                                venueAddress: data.walkInDetails.venueAddress!,
                                reportingTime: data.walkInDetails.reportingTime!,
                                requiredDocuments: data.walkInDetails.requiredDocuments || [],
                                contactPerson: data.walkInDetails.contactPerson,
                                contactPhone: data.walkInDetails.contactPhone
                            }
                        }
                    })
                },
                include: {
                    walkInDetails: true
                }
            });

            res.status(201).json({
                opportunity,
                message: 'Opportunity created successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/admin/opportunities
router.get('/', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const opportunities = await prisma.opportunity.findMany({
            include: {
                walkInDetails: true,
                _count: {
                    select: {
                        actions: true,
                        feedback: true
                    }
                }
            },
            orderBy: { postedAt: 'desc' }
        });

        res.json({ opportunities });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/opportunities/:id
router.get('/:id', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        if (!id) throw new AppError('Opportunity ID is required', 400);
        const opportunity = await prisma.opportunity.findUnique({
            where: { id },
            include: {
                walkInDetails: true,
                _count: {
                    select: {
                        actions: true,
                        feedback: true
                    }
                }
            }
        });

        if (!opportunity) {
            throw new AppError('Opportunity not found', 404);
        }

        res.json({ opportunity });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/opportunities/:id
router.put(
    '/:id',
    requireAdmin,
    adminRateLimit,
    withAdminAudit('UPDATE'),
    validate(opportunitySchema as any),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            if (!id) throw new AppError('Opportunity ID is required', 400);
            const data = req.body;

            // Prepare nested walk-in details update if applicable
            const walkInUpdate: any = {};
            if (data.type === OpportunityType.WALKIN && data.walkInDetails) {
                walkInUpdate.upsert = {
                    create: {
                        dates: data.walkInDetails.dates?.map((d: string) => new Date(d)) || [],
                        venueAddress: data.walkInDetails.venueAddress!,
                        reportingTime: data.walkInDetails.reportingTime!,
                        requiredDocuments: data.walkInDetails.requiredDocuments || [],
                        contactPerson: data.walkInDetails.contactPerson,
                        contactPhone: data.walkInDetails.contactPhone
                    },
                    update: {
                        dates: data.walkInDetails.dates?.map((d: string) => new Date(d)) || [],
                        venueAddress: data.walkInDetails.venueAddress!,
                        reportingTime: data.walkInDetails.reportingTime!,
                        requiredDocuments: data.walkInDetails.requiredDocuments || [],
                        contactPerson: data.walkInDetails.contactPerson,
                        contactPhone: data.walkInDetails.contactPhone
                    }
                };
            }

            const opportunity = await prisma.opportunity.update({
                where: { id },
                data: {
                    type: data.type,
                    title: data.title,
                    company: data.company,
                    description: data.description,
                    allowedDegrees: data.allowedDegrees,
                    allowedPassoutYears: data.allowedPassoutYears,
                    requiredSkills: data.requiredSkills || [],
                    locations: data.locations,
                    workMode: data.workMode,
                    salaryMin: data.salaryMin,
                    salaryMax: data.salaryMax,
                    applyLink: data.applyLink,
                    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                    lastVerified: new Date(),
                    ...(data.type === OpportunityType.WALKIN && { walkInDetails: walkInUpdate })
                },
                include: {
                    walkInDetails: true
                }
            });

            res.json({
                opportunity,
                message: 'Opportunity updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

// POST /api/admin/opportunities/:id/expire
router.post(
    '/:id/expire',
    requireAdmin,
    withAdminAudit('EXPIRE'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            if (!id) throw new AppError('Opportunity ID is required', 400);

            const opportunity = await prisma.opportunity.update({
                where: { id },
                data: {
                    status: OpportunityStatus.EXPIRED,
                    expiredAt: new Date()
                }
            });

            res.json({
                opportunity,
                message: 'Opportunity marked as expired'
            });
        } catch (error) {
            next(error);
        }
    }
);

// DELETE /api/admin/opportunities/:id
router.delete(
    '/:id',
    requireAdmin,
    adminRateLimit,
    validateReason,
    withAdminAudit('DELETE'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            if (!id) throw new AppError('Opportunity ID is required', 400);
            const { reason } = req.body;

            // Soft delete - mark as REMOVED
            const opportunity = await prisma.opportunity.update({
                where: { id },
                data: {
                    status: OpportunityStatus.REMOVED,
                    deletedAt: new Date(),
                    deletionReason: reason || 'Deleted by admin'
                }
            });

            res.json({
                opportunity,
                message: 'Opportunity removed successfully (soft delete)'
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
