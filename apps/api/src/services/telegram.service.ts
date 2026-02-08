import axios from 'axios';

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

    /**
     * Send a simple text message to the admin
     */
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
                text: text,
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

    /**
     * Send a notification about a new user signup
     */
    async notifyNewUser(email: string, name: string): Promise<void> {
        const message = `
🚀 <b>New User Signup</b>
------------------------
👤 <b>Name:</b> ${name}
📧 <b>Email:</b> ${email}
------------------------
<i>FresherFlow Admin</i>
        `;
        await this.sendMessage(message);
    }

    /**
     * Send a notification about a critical system error
     */
    async notifyError(context: string, error: any): Promise<void> {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        const dedupeKey = `${context}::${errorMessage}`;
        const now = Date.now();
        const lastSent = this.lastErrorSentAt.get(dedupeKey) || 0;
        if (now - lastSent < this.errorCooldownMs) {
            return;
        }
        this.lastErrorSentAt.set(dedupeKey, now);
        const message = `
🚨 <b>Critical Error</b>
------------------------
📂 <b>Context:</b> ${context}
❌ <b>Error:</b> ${errorMessage}
------------------------
<i>FresherFlow System</i>
        `;
        await this.sendMessage(message);
    }

    /**
     * Send a notification about a new job post
     */
    async notifyNewJob(jobTitle: string, company: string, jobId: string, isLive: boolean): Promise<void> {
        const status = isLive ? '✅ LIVE' : '⏸️ DRAFT';
        const message = `
💼 <b>New Job Created</b>
------------------------
🏢 <b>Company:</b> ${company}
👨‍💻 <b>Role:</b> ${jobTitle}
📊 <b>Status:</b> ${status}
🆔 <b>ID:</b> ${jobId}
------------------------
<i>FresherFlow Admin</i>
        `;
        await this.sendMessage(message);
    }

    /**
     * Broadcast a message to a public channel (requires channel username like @fresherflow_jobs)
     */
    async broadcastToChannel(channelUsername: string, text: string): Promise<void> {
        if (!this.botToken) return;

        try {
            await axios.post(`${this.baseUrl}/sendMessage`, {
                chat_id: channelUsername,
                text: text,
                parse_mode: 'HTML',
                disable_web_page_preview: false
            });
        } catch (error) {
            console.error(`TelegramService Broadcast Error (${channelUsername}):`, error);
        }
    }

    /**
     * Broadcast a new job opportunity to the public channel
     */
    async broadcastNewOpportunity(
        title: string,
        company: string,
        type: string,
        locations: string[],
        applyLink: string,
        slug: string
    ): Promise<void> {
        const publicChannel = process.env.TELEGRAM_PUBLIC_CHANNEL;
        if (!publicChannel || !this.botToken) {
            console.log('TelegramService: Public channel not configured, skipping broadcast.');
            return;
        }

        const typeEmoji = type === 'JOB' ? '💼' : type === 'INTERNSHIP' ? '🎓' : '🚶';
        const locationText = locations.length > 0 ? locations.join(', ') : 'Remote/Multiple';
        const jobUrl = `${process.env.FRONTEND_URL || 'https://fresherflow.in'}/opportunities/${slug}`;

        const message = `
${typeEmoji} <b>${title}</b>
🏢 <b>Company:</b> ${company}
📍 <b>Location:</b> ${locationText}
🔗 <b>Apply:</b> <a href="${applyLink}">Official Application Link</a>

📋 View full details: <a href="${jobUrl}">FresherFlow</a>

<i>#FresherJobs #OffCampus #Hiring</i>
        `.trim();

        await this.broadcastToChannel(publicChannel, message);
    }
}

export default new TelegramService();
