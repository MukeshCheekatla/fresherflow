import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '30d';

export interface TokenPayload {
    userId: string;
    type: 'access' | 'refresh';
}

export interface AdminTokenPayload {
    adminId: string;
    role: 'admin';
}

// User Tokens
export function generateAccessToken(userId: string): string {
    // @ts-ignore - JWT type issue
    return jwt.sign({ userId, type: 'access' }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

export function generateRefreshToken(userId: string): { token: string; hash: string } {
    // @ts-ignore - JWT type issue
    const token = jwt.sign({ userId, type: 'refresh' }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });

    // Hash for DB storage
    const hash = crypto.createHash('sha256').update(token as string).digest('hex');

    return { token: token as string, hash };
}

export function verifyAccessToken(token: string): string | null {
    try {
        const payload = jwt.verify(token, ACCESS_SECRET) as TokenPayload;
        if (payload.type !== 'access') return null;
        return payload.userId;
    } catch {
        return null;
    }
}

export function verifyRefreshToken(token: string): string | null {
    try {
        const payload = jwt.verify(token, REFRESH_SECRET) as TokenPayload;
        if (payload.type !== 'refresh') return null;
        return payload.userId;
    } catch {
        return null;
    }
}

export function hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// Admin Tokens
export function generateAdminToken(adminId: string): string {
    // @ts-ignore - JWT type issue
    return jwt.sign({ adminId, role: 'admin' }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

export function verifyAdminToken(token: string): string | null {
    try {
        const payload = jwt.verify(token, ACCESS_SECRET) as AdminTokenPayload;
        if (payload.role !== 'admin') return null;
        return payload.adminId;
    } catch {
        return null;
    }
}
