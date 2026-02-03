import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateAdminToken } from '../../utils/jwt';
import { validate } from '../../middleware/validate';
import { loginSchema } from '../../utils/validation';
import { AppError } from '../../middleware/errorHandler';
import { requireAdmin } from '../../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

// POST /api/admin/auth/login
router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // Find admin
        const admin = await prisma.admin.findUnique({
            where: { email }
        });

        if (!admin) {
            return next(new AppError('Invalid credentials', 401));
        }

        // Verify password
        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) {
            return next(new AppError('Invalid credentials', 401));
        }

        // Generate admin token
        const token = generateAdminToken(admin.id);

        res.json({
            admin: {
                id: admin.id,
                email: admin.email,
                fullName: admin.fullName
            },
            accessToken: token
        });
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

