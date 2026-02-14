import { OpportunityStatus, PrismaClient } from '@prisma/client';
import { filterOpportunitiesForUser, rankOpportunitiesForUser } from '../domain/eligibility';
import logger from '../utils/logger';
import { EmailService } from './email.service';

const prisma = new PrismaClient();

/**
 * Notification Service for Instant Job Alerts
 * Triggers when admin publishes new opportunity
 */

interface NewJobNotificationResult {
    usersSent: number;
    emailsSent: number;
    appAlertsSent: number;
}

export async function sendNewJobAlerts(opportunityId: string): Promise<NewJobNotificationResult> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Get the opportunity with details
    const opportunity = await prisma.opportunity.findUnique({
        where: { id: opportunityId },
        include: { walkInDetails: true }
    });

    if (!opportunity || opportunity.status !== OpportunityStatus.PUBLISHED) {
        logger.info('Skipping alerts for non-published opportunity', { opportunityId });
        return { usersSent: 0, emailsSent: 0, appAlertsSent: 0 };
    }

    // Get all users with alert preferences enabled
    const users = await prisma.user.findMany({
        where: {
            role: 'USER',
            alertPreference: {
                enabled: true,
            },
        },
        select: {
            id: true,
            email: true,
            fullName: true,
            profile: true,
            alertPreference: true,
        },
    });

    let emailsSent = 0;
    let appAlertsSent = 0;
    const usersSent = new Set<string>();

    for (const user of users) {
        if (!user.profile || !user.alertPreference) continue;

        // Check if user is eligible for this opportunity
        const eligible = filterOpportunitiesForUser([opportunity as any], user.profile as any);
        if (eligible.length === 0) continue;

        // Rank to get relevance score
        const ranked = rankOpportunitiesForUser(eligible as any, user.profile as any);
        if (ranked.length === 0) continue;

        const relevanceScore = ranked[0].score;
        if (relevanceScore < user.alertPreference.minRelevanceScore) continue;

        // Create dedupe key
        const dedupeKeyBase = `${user.id}:NEW_JOB:${opportunityId}`;
        const existing = await prisma.alertDelivery.findFirst({
            where: {
                OR: [
                    { dedupeKey: `${dedupeKeyBase}:APP` },
                    { dedupeKey: `${dedupeKeyBase}:EMAIL` },
                ],
            },
            select: { id: true },
        });
        if (existing) continue;

        const deliveriesToCreate: Array<{
            userId: string;
            opportunityId: string;
            kind: 'NEW_JOB';
            channel: 'APP' | 'EMAIL';
            dedupeKey: string;
            metadata: string;
        }> = [
            {
                userId: user.id,
                opportunityId: opportunity.id,
                kind: 'NEW_JOB',
                channel: 'APP',
                dedupeKey: `${dedupeKeyBase}:APP`,
                metadata: JSON.stringify({ relevanceScore }),
            },
        ];

        // Send email if enabled
        if (user.alertPreference.emailEnabled) {
            try {
                await EmailService.sendNewJobAlert(user.email, user.fullName, {
                    title: opportunity.title,
                    company: opportunity.company,
                    location: opportunity.locations?.[0] || null,
                    applyUrl: `${frontendUrl.replace(/\/$/, '')}/opportunities/${opportunity.slug}`,
                });
                emailsSent++;
                deliveriesToCreate.push({
                    userId: user.id,
                    opportunityId: opportunity.id,
                    kind: 'NEW_JOB',
                    channel: 'EMAIL',
                    dedupeKey: `${dedupeKeyBase}:EMAIL`,
                    metadata: JSON.stringify({ relevanceScore }),
                });
            } catch (err) {
                logger.error('Failed to send new job email', { userId: user.id, opportunityId, error: err });
            }
        }

        // Create alert delivery records
        await prisma.alertDelivery.createMany({
            data: deliveriesToCreate,
            skipDuplicates: true,
        });

        appAlertsSent++;
        usersSent.add(user.id);
    }

    logger.info('New job alerts sent', {
        opportunityId,
        usersSent: usersSent.size,
        emailsSent,
        appAlertsSent
    });

    return {
        usersSent: usersSent.size,
        emailsSent,
        appAlertsSent
    };
}
