import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class TelegramService {
    private botToken: string;
    private chatId: string;
    private baseUrl: string;
    private allowInDev: boolean;
    private hasWarnedFailure: boolean;
    private lastErrorSentAt: Map<string, number>;
    private errorCooldownMs: number;

    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
        this.chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || '';
        this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
        this.allowInDev = process.env.TELEGRAM_ALLOW_DEV === 'true';
        this.hasWarnedFailure = false;
        this.lastErrorSentAt = new Map();
        const cooldownMinutes = Number(process.env.TELEGRAM_ERROR_COOLDOWN_MINUTES || '5');
        this.errorCooldownMs = Math.max(1, cooldownMinutes) * 60 * 1000;
    }

    private get isConfigured(): boolean {
        if (process.env.NODE_ENV !== 'production' && !this.allowInDev) return false;
        return !!this.botToken && !!this.chatId;
    }

    async sendMessage(text: string): Promise<void> {
        if (!this.isConfigured) {
            if (!this.hasWarnedFailure) {
                const reason = process.env.NODE_ENV !== 'production' && !this.allowInDev
                    ? 'disabled in non-production'
                    : 'credentials missing';
                console.warn(`TelegramService: ${reason}, skipping message.`);
                this.hasWarnedFailure = true;
            }
            return;
        }

        try {
            await axios.post(`${this.baseUrl}/sendMessage`, {
                chat_id: this.chatId,
                text,
                parse_mode: 'HTML'
            });
        } catch (error: any) {
            if (this.hasWarnedFailure) return;
            const status = error?.response?.status;
            const description = error?.response?.data?.description;
            const reason = description ? `(${status}) ${description}` : (status ? `(${status})` : 'unknown error');
            console.error(`TelegramService Error: ${reason}`);
            this.hasWarnedFailure = true;
        }
    }

    async notifyNewUser(email: string, name: string): Promise<void> {
        const message = [
            '<b>New User Signup</b>',
            '------------------------',
            `<b>Name:</b> ${name}`,
            `<b>Email:</b> ${email}`,
            '------------------------',
            '<i>FresherFlow Admin</i>'
        ].join('\n');
        await this.sendMessage(message);
    }

    async notifyError(context: string, error: any): Promise<void> {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        const dedupeKey = `${context}::${errorMessage}`;
        const now = Date.now();
        const lastSent = this.lastErrorSentAt.get(dedupeKey) || 0;
        if (now - lastSent < this.errorCooldownMs) {
            return;
        }
        this.lastErrorSentAt.set(dedupeKey, now);

        const message = [
            '<b>Critical Error</b>',
            '------------------------',
            `<b>Context:</b> ${context}`,
            `<b>Error:</b> ${errorMessage}`,
            '------------------------',
            '<i>FresherFlow System</i>'
        ].join('\n');
        await this.sendMessage(message);
    }

    async notifyNewJob(jobTitle: string, company: string, jobId: string, isLive: boolean): Promise<void> {
        const status = isLive ? 'LIVE' : 'DRAFT';
        const message = [
            '<b>New Job Created</b>',
            '------------------------',
            `<b>Company:</b> ${company}`,
            `<b>Role:</b> ${jobTitle}`,
            `<b>Status:</b> ${status}`,
            `<b>ID:</b> ${jobId}`,
            '------------------------',
            '<i>FresherFlow Admin</i>'
        ].join('\n');
        await this.sendMessage(message);
    }

    async broadcastToChannel(channelUsername: string, text: string): Promise<string | null> {
        if (!this.botToken) return null;

        try {
            const response = await axios.post(`${this.baseUrl}/sendMessage`, {
                chat_id: channelUsername,
                text,
                parse_mode: 'HTML',
                disable_web_page_preview: false
            });
            const messageId = response?.data?.result?.message_id;
            return messageId ? String(messageId) : null;
        } catch (error) {
            console.error(`TelegramService Broadcast Error (${channelUsername}):`, error);
            return null;
        }
    }

    async broadcastNewOpportunity(
        opportunityId: string,
        title: string,
        company: string,
        type: string,
        locations: string[],
        applyLink: string,
        slug: string,
        options?: { force?: boolean }
    ): Promise<void> {
        const publicChannel = process.env.TELEGRAM_PUBLIC_CHANNEL;
        const dedupeKey = `${opportunityId}:${publicChannel || 'unknown'}`;

        if (!publicChannel || !this.botToken) {
            console.log('TelegramService: Public channel not configured, skipping broadcast.');
            await prisma.telegramBroadcast.upsert({
                where: { dedupeKey },
                create: {
                    opportunityId,
                    channel: publicChannel || 'unknown',
                    dedupeKey,
                    status: 'SKIPPED',
                    errorMessage: 'Public channel or bot token not configured'
                },
                update: {
                    status: 'SKIPPED',
                    errorMessage: 'Public channel or bot token not configured'
                }
            }).catch(() => { });
            return;
        }

        const existing = await prisma.telegramBroadcast.findUnique({ where: { dedupeKey } });
        if (existing && existing.status === 'SENT' && !options?.force) {
            return;
        }

        const typeLabel = type === 'JOB' ? 'Job' : type === 'INTERNSHIP' ? 'Internship' : 'Walk-in';
        const locationText = locations.length > 0 ? locations.join(', ') : 'Remote/Multiple';
        const frontendOrigin = process.env.FRONTEND_URL || 'https://fresherflow.in';
        const jobUrl = new URL(`/opportunities/${slug}`, frontendOrigin);
        jobUrl.searchParams.set('ref', 'social');
        jobUrl.searchParams.set('source', 'opportunity_share');
        jobUrl.searchParams.set('utm_source', 'telegram');
        jobUrl.searchParams.set('utm_medium', 'channel');
        jobUrl.searchParams.set('utm_campaign', 'job_share');

        const message = [
            `<b>${title}</b>`,
            `<b>Type:</b> ${typeLabel}`,
            `<b>Company:</b> ${company}`,
            `<b>Location:</b> ${locationText}`,
            `<b>View details:</b> <a href="${jobUrl.toString()}">fresherflow.in</a>`,
            '',
            '<i>#FresherJobs #OffCampus #Hiring</i>'
        ].join('\n');

        const messageId = await this.broadcastToChannel(publicChannel, message);
        if (messageId) {
            await prisma.telegramBroadcast.upsert({
                where: { dedupeKey },
                create: {
                    opportunityId,
                    channel: publicChannel,
                    dedupeKey,
                    status: 'SENT',
                    messageId,
                    sentAt: new Date()
                },
                update: {
                    status: 'SENT',
                    messageId,
                    sentAt: new Date(),
                    errorMessage: null
                }
            });
            return;
        }

        await prisma.telegramBroadcast.upsert({
            where: { dedupeKey },
            create: {
                opportunityId,
                channel: publicChannel,
                dedupeKey,
                status: 'FAILED',
                errorMessage: 'Telegram sendMessage failed'
            },
            update: {
                status: 'FAILED',
                errorMessage: 'Telegram sendMessage failed'
            }
        });
    }
}

export default new TelegramService();
