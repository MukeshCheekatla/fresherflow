import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateAdminToken } from '@fresherflow/auth';
import { validate } from '../../middleware/validate';
import { loginSchema } from '../../utils/validation';
import { AppError } from '../../middleware/errorHandler';
import { requireAdmin } from '../../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as 'none' | 'lax' | 'strict',
    path: '/'
};

// POST /api/admin/auth/login
router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        console.log(`🔐 Admin login attempt for: ${email}`);

        // Find admin
        const admin = await prisma.admin.findUnique({
            where: { email }
        });

        if (!admin) {
            console.log('❌ Admin not found');
            return next(new AppError('Invalid credentials', 401));
        }

        console.log('✅ Admin found, verifying password...');

        // Verify password
        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) {
            console.log('❌ Invalid password');
            return next(new AppError('Invalid credentials', 401));
        }

        console.log('✅ Password verified, generating token...');

        // Generate admin token
        const token = generateAdminToken(admin.id);

        res.cookie('adminAccessToken', token, {
            ...COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000 // 15 mins (Consistent with other tokens)
        });

        console.log('✅ Login successful');

        res.json({
            admin: {
                id: admin.id,
                email: admin.email,
                fullName: admin.fullName
            }
            // token removed
        });
    } catch (error) {
        console.error('❌ Admin Login Error Detailed:', error);
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
        const admin = await prisma.admin.findUnique({
            where: { id: req.adminId }
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
