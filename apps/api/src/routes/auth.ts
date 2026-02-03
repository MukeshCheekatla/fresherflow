import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    hashRefreshToken
} from '@fresherflow/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validation';
import { AppError } from '../middleware/errorHandler';
// import { requireAuth } from '../middleware/auth'; // Need to update this too
import { requireAuth } from '../middleware/auth';
// import { calculateCompletion } from '../utils/profileCompletion'; 

const router: Router = express.Router();
const prisma = new PrismaClient();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as 'none' | 'lax' | 'strict',
    path: '/'
};

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, fullName } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return next(new AppError('Email already registered', 400));
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user with empty profile
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                fullName,
                profile: {
                    create: {
                        completionPercentage: 0
                    }
                }
            },
            include: { profile: true }
        });

        // Generate tokens
        const accessToken = generateAccessToken(user.id);
        const { token: refreshToken, hash: tokenHash } = generateRefreshToken(user.id);

        // Store refresh token
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
        });

        // Set Cookies
        res.cookie('accessToken', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000 // 15 mins
        });

        res.cookie('refreshToken', refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName
            },
            profile: {
                completionPercentage: user.profile?.completionPercentage || 0
            },
            // tokens removed - cookies only
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true }
        });

        if (!user) {
            return next(new AppError('Invalid email or password', 401));
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return next(new AppError('Invalid email or password', 401));
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id);
        const { token: refreshToken, hash: tokenHash } = generateRefreshToken(user.id);

        // Store refresh token
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });

        // Set Cookies
        res.cookie('accessToken', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000 // 15 mins
        });

        res.cookie('refreshToken', refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName
            },
            profile: {
                completionPercentage: user.profile?.completionPercentage || 0
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/refresh
// No validation schema needed for body since we read from cookie
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return next(new AppError('No refresh token provided', 401));
        }

        // Verify token
        const userId = verifyRefreshToken(refreshToken);
        if (!userId) {
            return next(new AppError('Invalid refresh token', 401));
        }

        // Check if token exists in DB and not revoked
        const tokenHash = hashRefreshToken(refreshToken);
        const storedToken = await prisma.refreshToken.findFirst({
            where: {
                tokenHash,
                userId,
                revokedAt: null,
                expiresAt: { gt: new Date() }
            }
        });

        if (!storedToken) {
            return next(new AppError('Refresh token expired or revoked', 401));
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(userId);

        // Set New Access Token Cookie
        res.cookie('accessToken', newAccessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000 // 15 mins
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            const tokenHash = hashRefreshToken(refreshToken);

            // Revoke refresh token
            await prisma.refreshToken.updateMany({
                where: { tokenHash },
                data: { revokedAt: new Date() }
            });
        }

        // Clear cookies
        res.clearCookie('accessToken', COOKIE_OPTIONS);
        res.clearCookie('refreshToken', COOKIE_OPTIONS);

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { profile: true }
        });

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName
            },
            profile: user.profile ? {
                completionPercentage: user.profile.completionPercentage,
                educationLevel: user.profile.educationLevel,
                courseName: user.profile.gradCourse,
                specialization: user.profile.gradSpecialization,
                passoutYear: user.profile.gradYear,
                interestedIn: user.profile.interestedIn,
                preferredCities: user.profile.preferredCities,
                workModes: user.profile.workModes,
                availability: user.profile.availability,
                skills: user.profile.skills
            } : null
        });
    } catch (error) {
        next(error);
    }
});

export default router;
