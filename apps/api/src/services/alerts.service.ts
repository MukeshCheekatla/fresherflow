import { OpportunityStatus, OpportunityType, PrismaClient } from '@prisma/client';
import { filterOpportunitiesForUser, rankOpportunitiesForUser } from '../domain/eligibility';
import logger from '../utils/logger';
import { EmailService } from './email.service';

const prisma = new PrismaClient();
const CLOSING_SOON_WINDOW_HOURS = 48;

type TzParts = { dateKey: string; hour: number };

function getTimezoneParts(date: Date, timezone: string): TzParts {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    return {
        dateKey: `${map.year}-${map.month}-${map.day}`,
        hour: Number(map.hour ?? 0),
    };
}

function buildOpportunityUrl(frontendUrl: string, slug: string) {
    return `${frontendUrl.replace(/\/$/, '')}/opportunities/${slug}`;
}

function getClosingSoonHours(opportunity: {
    type: OpportunityType;
    expiresAt: Date | null;
    walkInDetails?: { dates: Date[] } | null;
}, now: Date): number | null {
    if (opportunity.type === 'WALKIN') {
        const dates = opportunity.walkInDetails?.dates ?? [];
        if (dates.length === 0) return null;
        const lastDate = new Date(Math.max(...dates.map((d) => new Date(d).getTime())));
        lastDate.setUTCHours(23, 59, 59, 999);
        const diffHours = (lastDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours <= CLOSING_SOON_WINDOW_HOURS ? diffHours : null;
    }

    if (!opportunity.expiresAt) return null;
    const diffHours = (new Date(opportunity.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= CLOSING_SOON_WINDOW_HOURS ? diffHours : null;
}

async function sendDailyDigestForUser(
    frontendUrl: string,
    user: { id: string; email: string; fullName: string | null; profile: any },
    preference: any,
    now: Date
): Promise<boolean> {
    if (!preference.dailyDigest) return false;
    if (!user.profile) return false;

    const timezone = preference.timezone || 'Asia/Kolkata';
    const current = getTimezoneParts(now, timezone);
    if (current.hour !== preference.preferredHour) return false;

    if (preference.lastDigestSentAt) {
        const last = getTimezoneParts(new Date(preference.lastDigestSentAt), timezone);
        if (last.dateKey === current.dateKey) return false;
    }

    const opportunities = await prisma.opportunity.findMany({
        where: {
            status: OpportunityStatus.PUBLISHED,
            deletedAt: null,
            expiredAt: null,
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        include: { walkInDetails: true },
        orderBy: { postedAt: 'desc' },
        take: 200,
    });

    const eligible = filterOpportunitiesForUser(opportunities as any, user.profile as any);
    const ranked = rankOpportunitiesForUser(eligible as any, user.profile as any)
        .filter((item) => item.score >= preference.minRelevanceScore)
        .slice(0, 8);

    if (ranked.length === 0) return false;

    const dedupeKey = `${user.id}:DAILY_DIGEST:${current.dateKey}`;
    const existing = await prisma.alertDelivery.findUnique({ where: { dedupeKey } });
    if (existing) return false;

    if (preference.emailEnabled) {
        await EmailService.sendOpportunityDigest(
            user.email,
            user.fullName,
            ranked.map((item) => ({
                title: item.opportunity.title,
                company: item.opportunity.company,
                location: item.opportunity.locations?.[0] || null,
                applyUrl: buildOpportunityUrl(frontendUrl, item.opportunity.slug),
            }))
        );
    }

    await prisma.$transaction([
        prisma.alertDelivery.create({
            data: {
                userId: user.id,
                kind: 'DAILY_DIGEST',
                channel: 'EMAIL',
                dedupeKey: `${dedupeKey}:EMAIL`,
                metadata: JSON.stringify({ count: ranked.length }),
            },
        }),
        prisma.alertDelivery.create({
            data: {
                userId: user.id,
                kind: 'DAILY_DIGEST',
                channel: 'APP',
                dedupeKey: `${dedupeKey}:APP`,
                metadata: JSON.stringify({ count: ranked.length }),
            },
        }),
        prisma.alertPreference.update({
            where: { userId: user.id },
            data: { lastDigestSentAt: now },
        }),
    ]);
    return true;
}

async function sendClosingSoonForUser(
    frontendUrl: string,
    user: { id: string; email: string; fullName: string | null; profile: any },
    preference: any,
    now: Date
): Promise<boolean> {
    if (!preference.closingSoon) return false;
    if (!user.profile) return false;

    const opportunities = await prisma.opportunity.findMany({
        where: {
            status: OpportunityStatus.PUBLISHED,
            deletedAt: null,
            expiredAt: null,
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        include: { walkInDetails: true },
        orderBy: { postedAt: 'desc' },
        take: 200,
    });

    const eligible = filterOpportunitiesForUser(opportunities as any, user.profile as any);
    const ranked = rankOpportunitiesForUser(eligible as any, user.profile as any)
        .filter((item) => item.score >= preference.minRelevanceScore)
        .sort((a, b) => b.score - a.score);

    for (const item of ranked) {
        const hoursLeft = getClosingSoonHours(item.opportunity as any, now);
        if (!hoursLeft) continue;

        const dayKey = now.toISOString().slice(0, 10);
        const dedupeKey = `${user.id}:CLOSING_SOON:${item.opportunity.id}:${dayKey}`;
        const alreadySent = await prisma.alertDelivery.findUnique({ where: { dedupeKey } });
        if (alreadySent) continue;

        const expiresText = hoursLeft <= 24
            ? `Expires in ${Math.max(1, Math.round(hoursLeft))} hours`
            : `Expires in ${Math.ceil(hoursLeft / 24)} days`;

        if (preference.emailEnabled) {
            await EmailService.sendClosingSoonAlert(user.email, user.fullName, {
                title: item.opportunity.title,
                company: item.opportunity.company,
                expiresText,
                applyUrl: buildOpportunityUrl(frontendUrl, item.opportunity.slug),
            });
        }

        await prisma.alertDelivery.createMany({
            data: [
                {
                    userId: user.id,
                    opportunityId: item.opportunity.id,
                    kind: 'CLOSING_SOON',
                    channel: 'EMAIL',
                    dedupeKey: `${dedupeKey}:EMAIL`,
                    metadata: JSON.stringify({ hoursLeft: Math.round(hoursLeft) }),
                },
                {
                    userId: user.id,
                    opportunityId: item.opportunity.id,
                    kind: 'CLOSING_SOON',
                    channel: 'APP',
                    dedupeKey: `${dedupeKey}:APP`,
                    metadata: JSON.stringify({ hoursLeft: Math.round(hoursLeft) }),
                }
            ],
            skipDuplicates: true
        });
        return true;
    }
    return false;
}

export async function runAlertsCycle() {
    const now = new Date();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const users = await prisma.user.findMany({
        where: {
            role: 'USER',
            alertPreference: {
                enabled: true,
                // emailEnabled: true, // Keep commented out as requested
            },
        },
        select: {
            id: true,
            email: true,
            fullName: true,
            profile: true,
            alertPreference: true,
        },
        take: 1000,
    });

    let digestSent = 0;
    let closingSoonSent = 0;

    for (const user of users) {
        if (!user.alertPreference) continue;
        const sentDigest = await sendDailyDigestForUser(frontendUrl, user as any, user.alertPreference, now);
        const sentClosingSoon = await sendClosingSoonForUser(frontendUrl, user as any, user.alertPreference, now);
        if (sentDigest) digestSent += 1;
        if (sentClosingSoon) closingSoonSent += 1;
    }

    logger.info('Alerts cycle completed', {
        usersChecked: users.length,
        digestSent,
        closingSoonSent,
    });

    return { usersChecked: users.length, digestSent, closingSoonSent };
}
