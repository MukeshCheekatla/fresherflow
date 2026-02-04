import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateAdminToken } from '@fresherflow/auth';
import { validate } from '../../middleware/validate';
import { loginSchema } from '../../utils/validation';
import { AppError } from '../../middleware/errorHandler';
import { requireAdmin } from '../../middleware/auth';
import rateLimit from 'express-rate-limit';

const router: Router = express.Router();
const prisma = new PrismaClient();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as 'none' | 'lax' | 'strict',
    path: '/'
};

// Rate limiting for admin auth endpoints
const adminAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: process.env.NODE_ENV === 'production' ? 10 : 100, // Relaxed for dev
    message: { error: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

// POST /api/admin/auth/login
router.post('/login', adminAuthLimiter, validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const emailInput = req.body.email.toLowerCase().trim();
        const { password } = req.body;

        // 1. Find user by email (case-insensitive)
        let user = await prisma.user.findFirst({
            where: {
                email: { equals: emailInput, mode: 'insensitive' },
                role: 'ADMIN'
            }
        });

        // 1.1 [NEW] Env-based first admin claim (No seed required)
        const envAdminEmail = (process.env.ADMIN_EMAIL || 'admin@fresherflow.com').toLowerCase();

        if (!user && emailInput === envAdminEmail) {
            // Check if ANY admin exists to prevent hijacking
            const anyAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

            if (!anyAdmin) {
                // If the user already exists as a regular USER, upgrade them
                // Otherwise create them new.
                user = await prisma.user.upsert({
                    where: { email: emailInput },
                    update: {
                        role: 'ADMIN',
                        passwordHash: null // Ensure setup flow triggers
                    },
                    create: {
                        email: emailInput,
                        role: 'ADMIN',
                        passwordHash: null,
                        fullName: 'System Admin'
                    }
                });
                console.log(`🛡️ First-time Admin claimed/upgraded via env: ${emailInput}`);
            }
        }

        if (!user) {
            return next(new AppError('Unauthorized: This email is not an administrator.', 401));
        }

        // 2. STAGE 1: Check for first-time password setup
        if (!user.passwordHash) {
            return res.json({
                setupRequired: true,
                message: 'First-time setup required. Please set your admin password.',
                admin: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName
                }
            });
        }

        // 3. STAGE 2: Standard bcrypt verification
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return next(new AppError('Invalid credentials', 401));
        }

        // 4. Generate admin token
        const token = generateAdminToken(user.id);
        const accessMaxAge = process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 24 * 60 * 60 * 1000;

        res.cookie('adminAccessToken', token, {
            ...COOKIE_OPTIONS,
            maxAge: accessMaxAge
        });

        res.json({
            admin: {
                id: user.id,
                email: user.email,
                fullName: user.fullName
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/admin/auth/setup-password
 * 
 * CRITICAL SECURITY LOCK:
 * 1. Only callable if user.role === 'ADMIN'
 * 2. Only callable if user.passwordHash === null (One-time use)
 * 3. Does NOT require auth token (since it's the first login)
 */
router.post('/setup-password', adminAuthLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const emailInput = req.body.email?.toLowerCase().trim();
        const { password } = req.body;

        if (!emailInput || !password || password.length < 8) {
            return next(new AppError('Valid email and password (min 8 chars) required', 400));
        }

        // Find user by email and ensure they are an admin with NO password yet
        const admin = await prisma.user.findFirst({
            where: {
                email: { equals: emailInput, mode: 'insensitive' },
                role: 'ADMIN',
                passwordHash: null // THE LOCK: Must be null to allow setup
            }
        });

        if (!admin) {
            // Either email is wrong, user isn't admin, or password is ALREADY set.
            // We return generic Unauthorised to avoid leakage, but the Logic Lock holds.
            return next(new AppError('Unauthorized or account already initialized', 403));
        }

        // Hash password with high cost
        const passwordHash = await bcrypt.hash(password, 12);

        // Save to DB - this automatically prevents future calls due to the 'passwordHash: null' filter above
        await prisma.user.update({
            where: { id: admin.id },
            data: { passwordHash }
        });

        // Auto-login after successful setup
        const token = generateAdminToken(admin.id);
        const accessMaxAge = process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 24 * 60 * 60 * 1000;

        res.cookie('adminAccessToken', token, {
            ...COOKIE_OPTIONS,
            maxAge: accessMaxAge
        });

        res.json({
            success: true,
            message: 'Admin account initialized successfully.',
            admin: {
                id: admin.id,
                email: admin.email,
                fullName: admin.fullName
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/admin/auth/logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie('adminAccessToken', COOKIE_OPTIONS);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/auth/me
router.get('/me', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const admin = await prisma.user.findFirst({
            where: { id: req.adminId, role: 'ADMIN' }
        });

        if (!admin) {
            return next(new AppError('Admin not found', 404));
        }

        res.json({
            admin: {
                id: admin.id,
                email: admin.email,
                fullName: admin.fullName
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
