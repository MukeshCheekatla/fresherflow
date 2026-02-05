import { Resend } from 'resend';
import logger from '../utils/logger';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Minimal Email Service
 * Integrated with Resend for production delivery.
 */
export class EmailService {
    /**
     * Send an OTP code to a user's email
     */
    static async sendOtp(email: string, code: string): Promise<void> {
        const localMessage = `
========================================
Verification Code for FresherFlow: ${code}
To: ${email}
Expires in: 5 minutes
========================================
        `;

        console.log(localMessage);
        logger.info(`OTP sent to ${email}: ${code}`);

        if (resend) {
            try {
                await resend.emails.send({
                    from: 'FresherFlow <onboarding@resend.dev>',
                    to: email,
                    subject: `${code} is your FresherFlow verification code`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #333 text-align: center;">FresherFlow Verification</h2>
                            <p style="font-size: 16px; color: #666; text-align: center;">To access your professional feed, please use the verification code below:</p>
                            <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">${code}</span>
                            </div>
                            <p style="font-size: 14px; color: #999; text-align: center;">This code will expire in 5 minutes.</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p style="font-size: 12px; color: #bbb; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
                        </div>
                    `
                });
                logger.info(`Email successfully delivered via Resend to ${email}`);
            } catch (error) {
                logger.error(`Failed to send email via Resend to ${email}:`, error);
                // We don't throw here to prevent breaking the flow if email delivery fails but we've logged the code
            }
        }
    }

    /**
     * Send a Magic Link to a user's email
     */
    static async sendMagicLink(email: string, link: string): Promise<void> {
        const localMessage = `
========================================
Magic Login Link for FresherFlow:
${link}
To: ${email}
Expires in: 15 minutes
========================================
        `;

        console.log(localMessage);
        logger.info(`Magic Link sent to ${email}`);

        if (resend) {
            try {
                await resend.emails.send({
                    from: 'FresherFlow <onboarding@resend.dev>',
                    to: email,
                    subject: `Login to FresherFlow`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #333; text-align: center;">Login to FresherFlow</h2>
                            <p style="font-size: 16px; color: #666; text-align: center;">Click the button below to log into your account. This link will expire in 15 minutes.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${link}" style="background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login to Dashboard</a>
                            </div>
                            <p style="font-size: 12px; color: #999; text-align: center;">If the button above doesn't work, copy and paste this link into your browser:</p>
                            <p style="font-size: 12px; color: #007bff; text-align: center; word-break: break-all;">${link}</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p style="font-size: 12px; color: #bbb; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
                        </div>
                    `
                });
                logger.info(`Magic link email successfully delivered via Resend to ${email}`);
            } catch (error) {
                logger.error(`Failed to send magic link via Resend to ${email}:`, error);
            }
        }
    }
}
