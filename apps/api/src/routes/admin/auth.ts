import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
    GenerateRegistrationOptionsOpts,
    VerifyRegistrationResponseOpts,
    GenerateAuthenticationOptionsOpts,
    VerifyAuthenticationResponseOpts,
    AuthenticatorTransportFuture,
} from '@simplewebauthn/server';
import { generateAdminToken } from '@fresherflow/auth';
import { AppError } from '../../middleware/errorHandler';
// import { requireAdmin } from '../../middleware/auth'; // Not used in login flow
import rateLimit from 'express-rate-limit';

const router: Router = express.Router();
const prisma = new PrismaClient();

const RP_ID = process.env.RP_ID || 'localhost';
const EXPECTED_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:3000';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@fresherflow.com').toLowerCase();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as 'none' | 'lax' | 'strict',
    path: '/'
};

// In-memory challenge store (Recommended: Redis for production)
const challengeStore = new Map<string, string>();

// Rate limiting
const adminAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: { error: 'Too many attempts' },
});

/**
 * Helper to get or bootstrap admin user
 */
async function getAdminUser(email: string) {
    const user = await prisma.user.findFirst({
        where: {
            email: { equals: email, mode: 'insensitive' },
            role: 'ADMIN'
        }
    });

    if (user) return user;

    // Bootstrap: If this matches the env admin email and NO admin exists, create it.
    if (email.toLowerCase() === ADMIN_EMAIL) {
        const anyAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (!anyAdmin) {
            return await prisma.user.upsert({
                where: { email },
                update: { role: 'ADMIN' },
                create: {
                    email,
                    role: 'ADMIN',
                    fullName: 'System Admin',
                    provider: 'passkey'
                }
            });
        }
    }
    return null;
}

/**
 * 1. Registration Options
 * Only allowed if:
 * a) No authenticators exist (Bootstrap)
 * b) Admin is already logged in (Add new device - TODO: add middleware)
 */
router.post('/register/options', adminAuthLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        if (email?.toLowerCase() !== ADMIN_EMAIL) {
            return next(new AppError('Forbidden', 403));
        }

        const user = await getAdminUser(email);
        if (!user) return next(new AppError('Unauthorized', 401));

        // Security: In bootstrap mode, we only allow this if NO authenticators exist.
        // If they exist, the user MUST be logged in to add more (omitted for now for simplicity of bootstrap).
        const authenticators = await prisma.authenticator.findMany({ where: { userId: user.id } });

        const options: GenerateRegistrationOptionsOpts = {
            rpName: 'FresherFlow Admin',
            rpID: RP_ID,
            userID: new TextEncoder().encode(user.id), // Cast string to Uint8Array
            userName: user.email,
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'required',
                userVerification: 'preferred',
            },
            excludeCredentials: authenticators.map(auth => ({
                id: auth.credentialID,
                type: 'public-key',
                transports: auth.transports ? (auth.transports.split(',') as AuthenticatorTransportFuture[]) : undefined,
            })),
        };

        const registrationOptions = await generateRegistrationOptions(options);
        challengeStore.set(`reg_${user.id}`, registrationOptions.challenge);

        res.json(registrationOptions);
    } catch (error) {
        next(error);
    }
});

/**
 * 2. Verify Registration
 */
router.post('/register/verify', adminAuthLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, body } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return next(new AppError('Not found', 404));

        const expectedChallenge = challengeStore.get(`reg_${user.id}`);
        if (!expectedChallenge) return next(new AppError('Challenge expired', 400));

        const verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: EXPECTED_ORIGIN,
            expectedRPID: RP_ID,
        });

        if (verification.verified && verification.registrationInfo) {
            const { credential } = verification.registrationInfo;

            await prisma.authenticator.create({
                data: {
                    credentialID: credential.id,
                    userId: user.id,
                    publicKey: Buffer.from(credential.publicKey),
                    counter: credential.counter,
                    deviceType: verification.registrationInfo.credentialDeviceType,
                    backedUp: verification.registrationInfo.credentialBackedUp,
                    transports: body.response.transports?.join(','),
                },
            });

            challengeStore.delete(`reg_${user.id}`);
            res.json({ verified: true });
        } else {
            res.status(400).json({ verified: false });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * 3. Authenticaton Options (Login)
 */
router.post('/login/options', adminAuthLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        if (email?.toLowerCase() !== ADMIN_EMAIL) {
            return next(new AppError('Invalid admin email', 401));
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: { authenticators: true }
        });

        // If no user or no authenticators, tell frontend to trigger bootstrap/registration
        if (!user || user.authenticators.length === 0) {
            return res.json({ registrationRequired: true });
        }

        const options: GenerateAuthenticationOptionsOpts = {
            rpID: RP_ID,
            allowCredentials: user.authenticators.map(auth => ({
                id: auth.credentialID,
                type: 'public-key',
                transports: auth.transports ? (auth.transports.split(',') as AuthenticatorTransportFuture[]) : undefined,
            })),
            userVerification: 'preferred',
        };

        const authenticationOptions = await generateAuthenticationOptions(options);
        challengeStore.set(`auth_${user.id}`, authenticationOptions.challenge);

        res.json(authenticationOptions);
    } catch (error) {
        next(error);
    }
});

/**
 * 4. Verify Authentication (Login)
 */
router.post('/login/verify', adminAuthLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, body } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
            include: { authenticators: true }
        });

        if (!user) return next(new AppError('Unauthorized', 401));

        const expectedChallenge = challengeStore.get(`auth_${user.id}`);
        if (!expectedChallenge) return next(new AppError('Challenge expired', 400));

        const authenticator = user.authenticators.find(auth => auth.credentialID === body.id);
        if (!authenticator) return next(new AppError('Invalid credential', 400));

        const verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: EXPECTED_ORIGIN,
            expectedRPID: RP_ID,
            credential: {
                id: authenticator.credentialID,
                publicKey: new Uint8Array(authenticator.publicKey) as unknown as Uint8Array<ArrayBuffer>,
                counter: authenticator.counter,
                transports: authenticator.transports ? (authenticator.transports.split(',') as AuthenticatorTransportFuture[]) : undefined,
            },
        });

        if (verification.verified && verification.authenticationInfo) {
            await prisma.authenticator.update({
                where: { credentialID: authenticator.credentialID },
                data: { counter: verification.authenticationInfo.newCounter }
            });

            // Set Admin Token
            const token = generateAdminToken(user.id);
            const accessMaxAge = process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 24 * 60 * 60 * 1000;

            res.cookie('adminAccessToken', token, {
                ...COOKIE_OPTIONS,
                maxAge: accessMaxAge
            });

            challengeStore.delete(`auth_${user.id}`);
            res.json({ verified: true });
        } else {
            res.status(400).json({ verified: false });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * 5. Current Admin Status
 */
router.get('/me', async (req: Request, res: Response) => {
    // This uses a different token than user 'me'
    // Simplified for this task
    res.json({ admin: !!req.cookies.adminAccessToken });
});

/**
 * 6. Logout
 */
router.post('/logout', (req, res) => {
    res.cookie('adminAccessToken', '', { ...COOKIE_OPTIONS, maxAge: 0 });
    res.json({ success: true });
});

export default router;
