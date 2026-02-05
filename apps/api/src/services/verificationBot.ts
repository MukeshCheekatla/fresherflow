import { PrismaClient, OpportunityStatus, LinkHealth } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Bot Configuration
const MAX_FAILURES = 3; // Quarantine after 3 fails
const REQUEST_TIMEOUT = 8000; // 8 seconds per ping

/**
 * Verification Bot Service
 * Performs lightweight health pings on published listings.
 */
export async function runLinkVerification() {
    const startTime = Date.now();
    logger.info('🤖 Verification Bot: Initiating link health scan...');

    try {
        // 1. Fetch all published opportunities that haven't been verified in the last 12 hours
        // and aren't already flagged as broken
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

        const opportunities = await prisma.opportunity.findMany({
            where: {
                status: OpportunityStatus.PUBLISHED,
                deletedAt: null,
                OR: [
                    { lastVerifiedAt: { lt: twelveHoursAgo } },
                    { linkHealth: LinkHealth.RETRYING }
                ]
            },
            select: {
                id: true,
                title: true,
                company: true,
                applyLink: true,
                verificationFailures: true
            },
            take: 50 // Batch size to prevent rate limiting outgoing requests
        });

        logger.info(`🤖 Verification Bot: Found ${opportunities.length} candidates for verification.`);

        let processed = 0;
        let broken = 0;

        for (const opp of opportunities) {
            if (!opp.applyLink) continue;

            const isHealthy = await pingUrl(opp.applyLink);
            processed++;

            if (isHealthy) {
                // Link is Healthy
                await prisma.opportunity.update({
                    where: { id: opp.id },
                    data: {
                        linkHealth: LinkHealth.HEALTHY,
                        verificationFailures: 0,
                        lastVerifiedAt: new Date(),
                        lastVerified: new Date() // Legacy field
                    }
                });
            } else {
                // Link is Broken or Timeout
                broken++;
                const newFailures = opp.verificationFailures + 1;

                logger.warn(`🤖 Verification Bot: Link failed for "${opp.title}" @ ${opp.company}. Failures: ${newFailures}`);

                await prisma.opportunity.update({
                    where: { id: opp.id },
                    data: {
                        verificationFailures: newFailures,
                        linkHealth: newFailures >= MAX_FAILURES ? LinkHealth.BROKEN : LinkHealth.RETRYING,
                        lastVerifiedAt: new Date(),
                        // If failures exceed max, optionally unpublish or move to draft
                        ...(newFailures >= MAX_FAILURES ? { status: OpportunityStatus.ARCHIVED } : {})
                    }
                });
            }
        }

        const duration = (Date.now() - startTime) / 1000;
        logger.info(`🤖 Verification Bot: Scan complete. Processed: ${processed}, Flagged Broken: ${broken}. Duration: ${duration}s`);

        return { processed, broken, duration };
    } catch (error) {
        logger.error('🤖 Verification Bot Error:', error);
        throw error;
    }
}

/**
 * Lightweight HEAD request to check if a URL exists
 */
async function pingUrl(url: string): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
                'User-Agent': 'FresherFlow-VerificationBot/1.0 (+https://fresherflow.in)'
            }
        });

        clearTimeout(timeoutId);

        // Accept any 2xx or 3xx status
        return response.ok || (response.status >= 300 && response.status < 400);
    } catch (error: any) {
        // If HEAD fails, try a GET with range header (some servers block HEAD)
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

            const response = await fetch(url, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'FresherFlow-VerificationBot/1.0 (+https://fresherflow.in)',
                    'Range': 'bytes=0-0' // Request only the first byte
                }
            });

            clearTimeout(timeoutId);
            return response.ok || (response.status >= 300 && response.status < 400);
        } catch {
            return false;
        }
    }
}
