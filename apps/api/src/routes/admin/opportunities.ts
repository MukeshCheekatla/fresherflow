import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, OpportunityStatus, OpportunityType } from '@prisma/client';
import { requireAdmin } from '../../middleware/auth';
import { adminRateLimit } from '../../middleware/adminRateLimit';
import { withAdminAudit, validateReason } from '../../middleware/adminAudit';
import { validate } from '../../middleware/validate';
import { opportunitySchema } from '../../utils/validation';
import { AppError } from '../../middleware/errorHandler';
import { OpportunityService } from '../../services/opportunity.service';
import { ParserService } from '../../services/parser.service';
import { generateSlug } from '../../utils/slugify';

import TelegramService from '../../services/telegram.service';

const router: Router = express.Router();
const prisma = new PrismaClient();

// Apply Admin Auth Globally for this router
router.use(requireAdmin);

function normalizeTypeParam(raw?: string) {
    if (!raw) return undefined;
    const value = raw.toLowerCase();
    if (value === 'job' || value === 'jobs') return OpportunityType.JOB;
    if (value === 'internship' || value === 'internships') return OpportunityType.INTERNSHIP;
    if (value === 'walk-in' || value === 'walkin' || value === 'walkins' || value === 'walk-ins') return OpportunityType.WALKIN;
    const upper = raw.toUpperCase();
    if (Object.values(OpportunityType).includes(upper as OpportunityType)) return upper as OpportunityType;
    return undefined;
}

// GET /api/admin/opportunities/summary
router.get('/summary', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const now = new Date();
        const [total, active, walkins, expired] = await prisma.$transaction([
            prisma.opportunity.count(),
            prisma.opportunity.count({
                where: {
                    status: OpportunityStatus.PUBLISHED,
                    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
                }
            }),
            prisma.opportunity.count({ where: { type: OpportunityType.WALKIN } }),
            prisma.opportunity.count({ where: { expiresAt: { lte: now } } })
        ]);

        res.json({
            summary: {
                total,
                active,
                walkins,
                expired
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/admin/opportunities/parse
router.post('/parse', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Text is required' });
        }

        const parsed = ParserService.parse(text);
        res.json({ parsed });
    } catch (error) {
        next(error);
    }
});

// POST /api/admin/opportunities/bulk
router.post(
    '/bulk',
    withAdminAudit('BULK_ACTION'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ids, action, reason } = req.body;

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: 'IDs array is required' });
            }

            if (!action) {
                return res.status(400).json({ message: 'Action is required' });
            }

            let result;
            const now = new Date();

            switch (action) {
                case 'DELETE':
                    result = await prisma.opportunity.deleteMany({
                        where: { id: { in: ids } }
                    });
                    break;
                case 'ARCHIVE':
                    result = await prisma.opportunity.updateMany({
                        where: { id: { in: ids } },
                        data: { status: OpportunityStatus.ARCHIVED }
                    });
                    break;
                case 'PUBLISH':
                    result = await prisma.opportunity.updateMany({
                        where: { id: { in: ids } },
                        data: { status: OpportunityStatus.PUBLISHED }
                    });
                    break;
                case 'EXPIRE':
                    result = await prisma.opportunity.updateMany({
                        where: { id: { in: ids } },
                        data: { expiredAt: now }
                    });
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid action' });
            }

            res.json({
                message: `Bulk ${action.toLowerCase()} completed`,
                count: result.count
            });
        } catch (error) {
            next(error);
        }
    }
);

// POST /api/admin/opportunities
router.post(
    '/',
    adminRateLimit, // Rate limit mutation
    withAdminAudit('CREATE'),
    validate(opportunitySchema as any),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;

            // 1. Map Category -> Type
            let type = data.type;
            if (data.category) {
                const map: any = { 'job': 'JOB', 'internship': 'INTERNSHIP', 'walk-in': 'WALKIN' };
                type = map[data.category] || 'JOB';
            }

            // 2. Normalize Walk-in Details
            let walkInCreate = undefined;
            if (type === OpportunityType.WALKIN && data.walkInDetails) {
                // Handle aliases (date -> dates, venue -> venueAddress)
                const dates = data.walkInDetails.dates || (data.walkInDetails.date ? [data.walkInDetails.date] : []);
                const venueAddress = data.walkInDetails.venueAddress || data.walkInDetails.venue;
                const reportingTime = data.walkInDetails.reportingTime || data.walkInDetails.startTime;

                if (venueAddress) {
                    walkInCreate = {
                        create: {
                            dates: dates.map((d: string) => new Date(d)),
                            dateRange: data.walkInDetails.dateRange,
                            timeRange: data.walkInDetails.timeRange,
                            venueAddress,
                            venueLink: data.walkInDetails.venueLink,
                            reportingTime: reportingTime || 'Contact for timing',
                            requiredDocuments: data.walkInDetails.requiredDocuments || [],
                            contactPerson: data.walkInDetails.contactPerson,
                            contactPhone: data.walkInDetails.contactPhone
                        }
                    };
                }
            }

            // Generate unique slug
            const tempId = crypto.randomUUID();
            const slug = generateSlug(data.title, data.company, tempId);

            const opportunity = await prisma.opportunity.create({
                data: {
                    id: tempId,
                    slug,
                    type: type as OpportunityType,
                    title: data.title,
                    company: data.company,
                    description: data.description,
                    allowedDegrees: data.allowedDegrees,
                    allowedCourses: data.allowedCourses || [],
                    allowedPassoutYears: data.allowedPassoutYears,
                    requiredSkills: data.requiredSkills || [],
                    locations: data.locations,
                    workMode: data.workMode,

                    // New Fields
                    salaryRange: data.salaryRange,
                    stipend: data.stipend,
                    employmentType: data.employmentType,

                    // Legacy Mapping
                    salaryMin: data.salaryMin || (data.salaryRange ? parseInt(data.salaryRange) : undefined), // Fallback
                    salaryMax: data.salaryMax,
                    salaryPeriod: data.salaryPeriod,
                    incentives: data.incentives,
                    jobFunction: data.jobFunction,
                    experienceMin: data.experienceMin,
                    experienceMax: data.experienceMax,

                    applyLink: data.applyLink,
                    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                    postedByUserId: req.adminId!,
                    status: OpportunityStatus.PUBLISHED,

                    ...(walkInCreate && { walkInDetails: walkInCreate })
                },
                include: {
                    walkInDetails: true
                }
            });

            // Notify Admin via Telegram (Async)
            TelegramService.notifyNewJob(
                opportunity.title,
                opportunity.company,
                opportunity.id,
                opportunity.status === OpportunityStatus.PUBLISHED
            ).catch(() => { });

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
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, status, includeCounts, includeWalkInDetails, limit, offset, q, sort } = req.query;
        const where: any = {};

        const normalizedType = typeof type === 'string' ? normalizeTypeParam(type) : undefined;
        if (normalizedType) where.type = normalizedType;
        if (typeof status === 'string' && Object.values(OpportunityStatus).includes(status as OpportunityStatus)) {
            where.status = status as OpportunityStatus;
        }

        const take = typeof limit === 'string' && !Number.isNaN(Number(limit)) ? Number(limit) : undefined;
        const skip = typeof offset === 'string' && !Number.isNaN(Number(offset)) ? Number(offset) : undefined;

        const shouldIncludeCounts = includeCounts === 'true';
        const shouldIncludeWalkInDetails = includeWalkInDetails === 'true';

        const keyword = typeof q === 'string' ? q.trim() : '';
        if (keyword) {
            where.OR = [
                { title: { contains: keyword, mode: 'insensitive' } },
                { company: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
                { locations: { has: keyword } }
            ];
        }

        const sortKey = typeof sort === 'string' ? sort : '';
        let orderBy: any = { postedAt: 'desc' };
        if (sortKey === 'postedAt_asc') orderBy = { postedAt: 'asc' };
        if (sortKey === 'company_asc') orderBy = { company: 'asc' };
        if (sortKey === 'company_desc') orderBy = { company: 'desc' };
        if (sortKey === 'title_asc') orderBy = { title: 'asc' };
        if (sortKey === 'title_desc') orderBy = { title: 'desc' };
        if (sortKey === 'status_asc') orderBy = { status: 'asc' };
        if (sortKey === 'status_desc') orderBy = { status: 'desc' };

        const total = await prisma.opportunity.count({ where });

        const orderByClause = Array.isArray(orderBy)
            ? orderBy
            : [{ status: 'asc' }, orderBy];

        const opportunities = await prisma.opportunity.findMany({
            where,
            ...(take !== undefined ? { take } : {}),
            ...(skip !== undefined ? { skip } : {}),
            include: {
                ...(shouldIncludeWalkInDetails ? { walkInDetails: true } : {}),
                ...(shouldIncludeCounts
                    ? {
                        _count: {
                            select: {
                                actions: true,
                                feedback: true
                            }
                        }
                    }
                    : {})
            },
            orderBy: orderByClause
        });

        const pageSize = take || total || 1;
        const currentPage = take ? Math.floor((skip || 0) / take) + 1 : 1;
        const totalPages = take ? Math.max(1, Math.ceil(total / take)) : 1;

        res.json({
            opportunities,
            total,
            page: currentPage,
            pageSize,
            totalPages
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/opportunities/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        if (!id) throw new AppError('Opportunity ID or Slug is required', 400);

        const opportunity = await prisma.opportunity.findFirst({
            where: {
                OR: [
                    { id: id },
                    { slug: id }
                ]
            },
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
    adminRateLimit, // Rate limit mutation
    withAdminAudit('UPDATE'),
    validate(opportunitySchema as any),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const idParam = req.params.id as string;
            if (!idParam) throw new AppError('Opportunity ID is required', 400);
            const data = req.body;

            // Find existing first to resolve ID/Slug
            const existing = await prisma.opportunity.findFirst({
                where: {
                    OR: [
                        { id: idParam },
                        { slug: idParam }
                    ]
                }
            });

            if (!existing) {
                throw new AppError('Opportunity not found', 404);
            }

            const id = existing.id; // Use resolved UUID

            // Prepare nested walk-in details update if applicable
            const walkInUpdate: any = {};
            if (data.type === OpportunityType.WALKIN && data.walkInDetails) {
                const venueAddress = data.walkInDetails.venueAddress || data.walkInDetails.venue;
                const reportingTime = data.walkInDetails.reportingTime || data.walkInDetails.startTime;

                walkInUpdate.upsert = {
                    create: {
                        dates: data.walkInDetails.dates?.map((d: string) => new Date(d)) || [],
                        dateRange: data.walkInDetails.dateRange,
                        timeRange: data.walkInDetails.timeRange,
                        venueAddress: venueAddress!,
                        venueLink: data.walkInDetails.venueLink,
                        reportingTime: reportingTime || 'Contact for timing',
                        requiredDocuments: data.walkInDetails.requiredDocuments || [],
                        contactPerson: data.walkInDetails.contactPerson,
                        contactPhone: data.walkInDetails.contactPhone
                    },
                    update: {
                        dates: data.walkInDetails.dates?.map((d: string) => new Date(d)) || [],
                        dateRange: data.walkInDetails.dateRange,
                        timeRange: data.walkInDetails.timeRange,
                        venueAddress: venueAddress!,
                        venueLink: data.walkInDetails.venueLink,
                        reportingTime: reportingTime || 'Contact for timing',
                        requiredDocuments: data.walkInDetails.requiredDocuments || [],
                        contactPerson: data.walkInDetails.contactPerson,
                        contactPhone: data.walkInDetails.contactPhone
                    }
                };
            }

            // Regenerate slug if title or company changed
            const updateData: any = {
                type: data.type,
                status: data.status,
                title: data.title,
                company: data.company,
                description: data.description,
                allowedDegrees: data.allowedDegrees,
                allowedCourses: data.allowedCourses || [],
                allowedPassoutYears: data.allowedPassoutYears,
                requiredSkills: data.requiredSkills || [],
                locations: data.locations,
                workMode: data.workMode,
                salaryMin: data.salaryMin,
                salaryMax: data.salaryMax,
                salaryPeriod: data.salaryPeriod,
                incentives: data.incentives,
                jobFunction: data.jobFunction,
                experienceMin: data.experienceMin,
                experienceMax: data.experienceMax,
                salaryRange: data.salaryRange,
                stipend: data.stipend,
                employmentType: data.employmentType,
                applyLink: data.applyLink,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                lastVerified: new Date(),
                ...(data.type === OpportunityType.WALKIN && { walkInDetails: walkInUpdate })
            };

            // Update slug if title or company changed
            if (data.title !== existing.title || data.company !== existing.company) {
                updateData.slug = generateSlug(data.title, data.company, existing.id);
            }

            const opportunity = await prisma.opportunity.update({
                where: { id },
                data: updateData,
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
    adminRateLimit, // Rate limit mutation
    withAdminAudit('EXPIRE'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const idParam = req.params.id as string;
            if (!idParam) throw new AppError('Opportunity ID is required', 400);

            // Find existing first to resolve ID/Slug
            const existing = await prisma.opportunity.findFirst({
                where: {
                    OR: [
                        { id: idParam },
                        { slug: idParam }
                    ]
                }
            });

            if (!existing) throw new AppError('Opportunity not found', 404);

            const opportunity = await prisma.opportunity.update({
                where: { id: existing.id },
                data: {
                    expiresAt: new Date(Date.now() - 60 * 60 * 1000), // Update LOGIC field (backdated)
                    expiredAt: new Date() // Update AUDIT field (now)
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
    adminRateLimit, // Rate limit mutation
    validateReason,
    withAdminAudit('DELETE'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const idParam = req.params.id as string;
            if (!idParam) throw new AppError('Opportunity ID is required', 400);
            const { reason } = req.body;

            // Find existing first to resolve ID/Slug
            const existing = await prisma.opportunity.findFirst({
                where: {
                    OR: [
                        { id: idParam },
                        { slug: idParam }
                    ]
                }
            });

            if (!existing) throw new AppError('Opportunity not found', 404);

            // Soft delete - mark as ARCHIVED
            const opportunity = await prisma.opportunity.update({
                where: { id: existing.id },
                data: {
                    status: OpportunityStatus.ARCHIVED,
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

