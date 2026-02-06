import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Runtime validation for required env vars
// We check this when the functions are called or when the module is loaded if we want strictness.
// Given strict instructions, we'll keep the top-level check but gracefully handle if envs are loaded later? 
// No, better to check access time or provide a configure function?
// For "simpler code", let's assume env vars are present in the process.

const getAccessSecret = () => {
    if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error('JWT_ACCESS_SECRET is not defined');
    }
    return process.env.JWT_ACCESS_SECRET;
};

const getRefreshSecret = () => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    return process.env.JWT_REFRESH_SECRET;
};

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
    const expiry = process.env.ACCESS_TOKEN_EXPIRY || '15m';
    // @ts-ignore - JWT type issue
    return jwt.sign({ userId, type: 'access' }, getAccessSecret(), { expiresIn: expiry });
}

export function generateRefreshToken(userId: string): { token: string; hash: string } {
    const expiry = process.env.REFRESH_TOKEN_EXPIRY || '90d';
    // @ts-ignore - JWT type issue
    const token = jwt.sign({ userId, type: 'refresh' }, getRefreshSecret(), { expiresIn: expiry });

    // Hash for DB storage
    const hash = crypto.createHash('sha256').update(token as string).digest('hex');

    return { token: token as string, hash };
}

export function verifyAccessToken(token: string): string | null {
    try {
        const payload = jwt.verify(token, getAccessSecret()) as TokenPayload;
        if (payload.type !== 'access') return null;
        return payload.userId;
    } catch {
        return null;
    }
}

export function verifyRefreshToken(token: string): string | null {
    try {
        const payload = jwt.verify(token, getRefreshSecret()) as TokenPayload;
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
    const expiry = process.env.ACCESS_TOKEN_EXPIRY || '15m';
    // @ts-ignore - JWT type issue
    return jwt.sign({ adminId, role: 'admin' }, getAccessSecret(), { expiresIn: expiry });
}

export function verifyAdminToken(token: string): string | null {
    try {
        const payload = jwt.verify(token, getAccessSecret()) as AdminTokenPayload;
        if (payload.role !== 'admin') return null;
        return payload.adminId;
    } catch {
        return null;
    }
}
