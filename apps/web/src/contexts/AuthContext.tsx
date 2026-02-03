'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setTokens, clearTokens, getTokens } from '@/lib/api/client';
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
        const tokens = getTokens();

        if (!tokens.accessToken) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await authApi.me();
            setUser(response.user);
            setProfile(response.profile);
        } catch (error: any) {
            console.error('Failed to load user:', error);
            // ONLY clear tokens if the error is an authentication error (401)
            // or if the apiClient already redirected/cleared them.
            // If it's a network error or 500, we keep the tokens and let the user try again.
            if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('expired')) {
                clearTokens();
                setUser(null);
                setProfile(null);
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function login(email: string, password: string) {
        const response = await authApi.login(email, password);
        setTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        // Profile is not returned in AuthResponse, need to fetch separately
        const profileResponse: any = await authApi.me();
        setProfile(profileResponse.profile);
    }

    async function register(email: string, password: string, fullName: string) {
        const response = await authApi.register(email, password, fullName);
        setTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        // Profile is not returned in AuthResponse, need to fetch separately
        const profileResponse: any = await authApi.me();
        setProfile(profileResponse.profile);
    }

    async function logout() {
        await authApi.logout();
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

