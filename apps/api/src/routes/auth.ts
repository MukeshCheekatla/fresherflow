import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, hashRefreshToken } from '../utils/jwt';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validation';
import { AppError } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/auth';
import { calculateCompletion } from '../utils/profileCompletion';

const router: Router = express.Router();
const prisma = new PrismaClient();

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

        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName
            },
            profile: {
                completionPercentage: user.profile?.completionPercentage || 0
            },
            tokens: {
                accessToken,
                refreshToken
            }
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

        res.json({
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName
            },
            profile: {
                completionPercentage: user.profile?.completionPercentage || 0
            },
            tokens: {
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/refresh
router.post('/refresh', validate(refreshTokenSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;

        // Verify token
        const userId = verifyRefreshToken(refreshToken);
        if (!userId) {
            return next(new AppError('Invalid refresh token', 401));
        }

        // Check if token exists in  DB and not revoked
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

        res.json({
            accessToken: newAccessToken
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/logout
router.post('/logout', validate(refreshTokenSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        const tokenHash = hashRefreshToken(refreshToken);

        // Revoke refresh token
        await prisma.refreshToken.updateMany({
            where: { tokenHash },
            data: { revokedAt: new Date() }
        });

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
                courseName: user.profile.courseName,
                specialization: user.profile.specialization,
                passoutYear: user.profile.passoutYear,
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
