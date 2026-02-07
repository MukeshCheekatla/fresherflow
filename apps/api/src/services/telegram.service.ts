import axios from 'axios';

class TelegramService {
    private botToken: string;
    private chatId: string;
    private baseUrl: string;

    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
        this.chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || '';
        this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
    }

    private get isConfigured(): boolean {
        return !!this.botToken && !!this.chatId;
    }

    /**
     * Send a simple text message to the admin
     */
    async sendMessage(text: string): Promise<void> {
        if (!this.isConfigured) {
            console.warn('TelegramService: Credentials missing, skipping message.');
            return;
        }

        try {
            await axios.post(`${this.baseUrl}/sendMessage`, {
                chat_id: this.chatId,
                text: text,
                parse_mode: 'HTML'
            });
        } catch (error) {
            console.error('TelegramService Error:', error);
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
