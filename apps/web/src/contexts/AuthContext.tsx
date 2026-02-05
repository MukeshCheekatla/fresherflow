'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api/client';
import { User, Profile } from '@fresherflow/types';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, code: string) => Promise<void>;
    loginWithGoogle: (token: string) => Promise<void>;

    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user on mount
    useEffect(() => {
        loadUser();
    }, []);

    async function loadUser() {
        setIsLoading(true);
        try {
            // DEFENSIVE: Check if session marker cookie exists
            if (typeof document !== 'undefined') {
                const hasSession = document.cookie.includes('ff_logged_in=true');
                if (!hasSession) {
                    setUser(null);
                    setProfile(null);
                    setIsLoading(false);
                    return;
                }
            }

            // Attempt to fetch current user
            // If we have valid cookies, this will succeed.
            // If not, it will throw 401, and we'll catch it.
            const response = await authApi.me();
            setUser(response.user);
            // Verify if profile is full Profile or partial
            // The /me endpoint returns profile data
            setProfile(response.profile as Profile);
        } catch {
            // If 401, user is not logged in.
            // Don't log error to console as it's expected for guests.
            // Just ensure state is null.
            setUser(null);
            setProfile(null);
        } finally {
            setIsLoading(false);
        }
    }

    async function login(email: string, password: string) {
        await authApi.login(email, password);
        const meResponse = await authApi.me();
        setUser(meResponse.user);
        setProfile(meResponse.profile as Profile);
    }

    async function sendOtp(email: string) {
        await authApi.sendOtp(email);
    }

    async function verifyOtp(email: string, code: string) {
        await authApi.verifyOtp(email, code);
        const meResponse = await authApi.me();
        setUser(meResponse.user);
        setProfile(meResponse.profile as Profile);
    }

    async function loginWithGoogle(token: string) {
        await authApi.googleLogin(token);
        const meResponse = await authApi.me();
        setUser(meResponse.user);
        setProfile(meResponse.profile as Profile);
    }



    const [isLoggingOut, setIsLoggingOut] = useState(false);

    async function logout() {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        if (typeof window !== 'undefined') {
            (window as Window & { __isLoggingOut?: boolean }).__isLoggingOut = true;
        }

        try {
            const win = window as Window & { google?: { accounts: { id: { disableAutoSelect: () => void } } } };
            if (typeof window !== 'undefined' && win.google?.accounts?.id) {
                win.google.accounts.id.disableAutoSelect();
            }

            setUser(null);
            setProfile(null);
            await authApi.logout();
        } catch {
            // Ignore logout errors
        } finally {
            // Manually nuke cookies on client side as a failsafe
            if (typeof document !== 'undefined') {
                const cookiesToClear = ['accessToken', 'refreshToken', 'ff_logged_in'];
                cookiesToClear.forEach(name => {
                    // Try multiple patterns to ensure clearing
                    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
                    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=${window.location.hostname};`;
                    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
                    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=${window.location.hostname}; SameSite=Lax;`;
                });
            }
            // Use replace() instead of href to force full page reload and clear React state
            window.location.replace('/login');
        }
    }

    async function refreshUser() {
        await loadUser();
    }

    async function refreshProfile() {
        await loadUser();
    }

    return (
        <AuthContext.Provider
            value={{ user, profile, isLoading, login, sendOtp, verifyOtp, loginWithGoogle, logout, refreshUser, refreshProfile }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
