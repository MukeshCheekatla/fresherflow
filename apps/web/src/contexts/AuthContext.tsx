'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api/client';
import { User, Profile } from '@fresherflow/types';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, fullName: string) => Promise<void>;
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
        try {
            // Attempt to fetch current user
            // If we have valid cookies, this will succeed.
            // If not, it will throw 401, and we'll catch it.
            const response = await authApi.me();
            setUser(response.user);
            // Verify if profile is full Profile or partial
            // The /me endpoint returns profile data
            setProfile(response.profile as Profile);
        } catch (error: any) {
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
        const response = await authApi.login(email, password);
        // Cookies are set by server
        setUser(response.user);

        // Response might contain partial profile or full.
        // If partial, maybe we fetch full?
        // But /login returns completionPercentage.
        // Let's assume we might want to fetch full profile or just use what we have.
        // For consistency, let's call loadUser or set what we have.
        // But authApi.me() is the single source of truth for "session restored".

        // Ideally response from login has same shape as me, so we can use it.
        // If not, fetch me.
        const meResponse = await authApi.me();
        setUser(meResponse.user);
        setProfile(meResponse.profile as Profile);
    }

    async function register(email: string, password: string, fullName: string) {
        // Register also sets cookies
        const response = await authApi.register(email, password, fullName);
        setUser(response.user);
        // Ensure we load full profile state
        const meResponse = await authApi.me();
        setUser(meResponse.user);
        setProfile(meResponse.profile as Profile);
    }

    async function logout() {
        try {
            await authApi.logout();
        } catch (e) {
            // Ignore logout errors
        }
        setUser(null);
        setProfile(null);
    }

    async function refreshUser() {
        await loadUser();
    }

    async function refreshProfile() {
        await loadUser();
    }

    return (
        <AuthContext.Provider
            value={{ user, profile, isLoading, login, register, logout, refreshUser, refreshProfile }}
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
