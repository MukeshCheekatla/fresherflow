import { PrismaClient, OpportunityType, OpportunityStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Walk-in Service - Walk-in Event Management
 * 
 * Responsibilities:
 * - Get upcoming walk-ins
 * - City-based filtering
 * - Date-based sorting
 * - Attendance tracking
 */

export class WalkinService {
    /**
     * Get upcoming walk-ins for a city (next N days)
     */
    static async getUpcomingWalkins(city: string, days: number = 7) {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const walkins = await prisma.opportunity.findMany({
            where: {
                type: OpportunityType.WALKIN,
                status: OpportunityStatus.ACTIVE,
                deletedAt: null,
                locations: {
                    has: city, // Array contains city
                },
                walkInDetails: {
                    dates: {
                        some: {
                            gte: now,
                            lte: futureDate,
                        },
                    },
                },
            },
            include: {
                walkInDetails: true,
            },
            orderBy: {
                postedAt: 'desc',
            },
        });

        // Sort by nearest date
        return walkins.sort((a, b) => {
            const aNextDate = a.walkInDetails?.dates.find((d) => d >= now) || now;
            const bNextDate = b.walkInDetails?.dates.find((d) => d >= now) || now;
            return aNextDate.getTime() - bNextDate.getTime();
        });
    }

    /**
     * Get today's walk-ins for a city
     */
    static async getTodayWalkins(city: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return await prisma.opportunity.findMany({
            where: {
                type: OpportunityType.WALKIN,
                status: OpportunityStatus.ACTIVE,
                deletedAt: null,
                locations: {
                    has: city,
                },
                walkInDetails: {
                    dates: {
                        some: {
                            gte: today,
                            lt: tomorrow,
                        },
                    },
                },
            },
            include: {
                walkInDetails: true,
            },
        });
    }

    /**
     * Mark user as attended a walk-in
     */
    static async markAsAttended(userId: string, walkinId: string) {
        // Check if walk-in exists and is valid
        const walkin = await prisma.opportunity.findUnique({
            where: { id: walkinId },
            include: { walkInDetails: true },
        });

        if (!walkin || walkin.type !== OpportunityType.WALKIN) {
            throw new Error('Walk-in not found');
        }

        // Create or update user action
        return await prisma.userAction.upsert({
            where: {
                userId_opportunityId: {
                    userId,
                    opportunityId: walkinId,
                },
            },
            create: {
                userId,
                opportunityId: walkinId,
                actionType: 'ATTENDED',
            },
            update: {
                actionType: 'ATTENDED',
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Get all walk-ins user has attended
     */
    static async getUserAttendedWalkins(userId: string) {
        const actions = await prisma.userAction.findMany({
            where: {
                userId,
                actionType: 'ATTENDED',
            },
            include: {
                opportunity: {
                    include: {
                        walkInDetails: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return actions.map((action) => action.opportunity);
    }
}
