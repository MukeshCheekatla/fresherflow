import { PrismaClient, OpportunityStatus, OpportunityType } from '@prisma/client';
import { EligibilityService } from './eligibility.service';

const prisma = new PrismaClient();

/**
 * Opportunity Service - Business Logic Layer
 * 
 * Responsibilities:
 * - CRUD operations with business rules
 * - Eligibility filtering
 * - Status management
 * - Soft delete handling
 */

export class OpportunityService {
    /**
     * Create new opportunity (starts as DRAFT)
     */
    static async createOpportunity(data: any, adminId: string) {
        return await prisma.opportunity.create({
            data: {
                ...data,
                postedByAdminId: adminId,
                status: OpportunityStatus.DRAFT, // Always start as draft
            },
            include: {
                walkInDetails: true,
            },
        });
    }

    /**
     * Publish opportunity (DRAFT → ACTIVE)
     */
    static async publishOpportunity(id: string, adminId: string) {
        const opportunity = await prisma.opportunity.findUnique({
            where: { id },
        });

        if (!opportunity) {
            throw new Error('Opportunity not found');
        }

        if (opportunity.postedByAdminId !== adminId) {
            throw new Error('Unauthorized');
        }

        if (opportunity.status !== OpportunityStatus.DRAFT) {
            throw new Error('Can only publish draft opportunities');
        }

        return await prisma.opportunity.update({
            where: { id },
            data: {
                status: OpportunityStatus.ACTIVE,
                lastVerified: new Date(),
            },
        });
    }

    /**
     * Update opportunity
     */
    static async updateOpportunity(id: string, data: any, adminId: string) {
        const existing = await prisma.opportunity.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new Error('Opportunity not found');
        }

        if (existing.postedByAdminId !== adminId) {
            throw new Error('Unauthorized');
        }

        return await prisma.opportunity.update({
            where: { id },
            data: {
                ...data,
                lastVerified: new Date(),
            },
            include: {
                walkInDetails: true,
            },
        });
    }

    /**
     * Soft delete opportunity (sets deletedAt)
     */
    static async deleteOpportunity(id: string, adminId: string, reason: string) {
        const existing = await prisma.opportunity.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new Error('Opportunity not found');
        }

        if (existing.postedByAdminId !== adminId) {
            throw new Error('Unauthorized');
        }

        // Soft delete
        return await prisma.opportunity.update({
            where: { id },
            data: {
                status: OpportunityStatus.REMOVED,
                deletedAt: new Date(),
                deletionReason: reason,
            },
        });
    }

    /**
     * Expire opportunity (manual or automated)
     */
    static async expireOpportunity(id: string) {
        return await prisma.opportunity.update({
            where: { id },
            data: {
                status: OpportunityStatus.EXPIRED,
                expiredAt: new Date(),
            },
        });
    }

    /**
     * Get all opportunities for admin (includes drafts, expired, removed)
     */
    static async getAllForAdmin(adminId?: string) {
        const where: any = {};

        if (adminId) {
            where.postedByAdminId = adminId;
        }

        return await prisma.opportunity.findMany({
            where,
            include: {
                walkInDetails: true,
                admin: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                postedAt: 'desc',
            },
        });
    }

    /**
     * Get eligible opportunities for a user (with eligibility filtering)
     */
    static async getEligibleOpportunities(userId: string) {
        // Get user profile
        const profile = await prisma.profile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new Error('Profile not found - complete profile setup first');
        }

        // Get all active, non-deleted opportunities
        const opportunities = await prisma.opportunity.findMany({
            where: {
                status: OpportunityStatus.ACTIVE,
                deletedAt: null,
                OR: [
                    { expiresAt: null }, // No expiry date
                    { expiresAt: { gt: new Date() } }, // Not yet expired
                ],
            },
            include: {
                walkInDetails: true,
            },
            orderBy: {
                postedAt: 'desc',
            },
        });

        // Filter by eligibility
        const eligibleOpportunities = opportunities
            .map((opp) => {
                const eligibility = EligibilityService.checkEligibility(
                    {
                        educationLevel: profile.educationLevel,
                        passoutYear: profile.gradYear || 0,
                        interestedIn: profile.interestedIn,
                        preferredCities: profile.preferredCities,
                        workModes: profile.workModes,
                        availability: profile.availability,
                        skills: profile.skills,
                    },
                    {
                        type: opp.type,
                        allowedDegrees: opp.allowedDegrees,
                        allowedPassoutYears: opp.allowedPassoutYears,
                        allowedAvailability: opp.allowedAvailability,
                        requiredSkills: opp.requiredSkills,
                        locations: opp.locations,
                        workMode: opp.workMode,
                    }
                );

                return {
                    ...opp,
                    eligible: eligibility.eligible,
                    matchScore: eligibility.eligible
                        ? EligibilityService.getMatchScore(
                            {
                                educationLevel: profile.educationLevel,
                                passoutYear: profile.gradYear || 0,
                                interestedIn: profile.interestedIn,
                                preferredCities: profile.preferredCities,
                                workModes: profile.workModes,
                                availability: profile.availability,
                                skills: profile.skills,
                            },
                            {
                                type: opp.type,
                                allowedDegrees: opp.allowedDegrees,
                                allowedPassoutYears: opp.allowedPassoutYears,
                                allowedAvailability: opp.allowedAvailability,
                                requiredSkills: opp.requiredSkills,
                                locations: opp.locations,
                                workMode: opp.workMode,
                            }
                        )
                        : 0,
                };
            })
            .filter((opp) => opp.eligible)
            .sort((a, b) => {
                // Walk-ins first
                if (a.type === OpportunityType.WALKIN && b.type !== OpportunityType.WALKIN) return -1;
                if (b.type === OpportunityType.WALKIN && a.type !== OpportunityType.WALKIN) return 1;

                // Then by match score
                return b.matchScore - a.matchScore;
            });

        return eligibleOpportunities;
    }

    /**
     * Get single opportunity by ID
     */
    static async getOpportunityById(id: string) {
        return await prisma.opportunity.findUnique({
            where: { id },
            include: {
                walkInDetails: true,
                admin: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
    }
}
