'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminAuthApi } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

import { Admin } from '@fresherflow/types';

interface AdminContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    admin: Admin | null;
    login: (email: string, password: string) => Promise<{ setupRequired?: boolean }>;
    setupPassword: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check admin session on mount
    useEffect(() => {
        checkAdminSession();
    }, []);

    async function checkAdminSession() {
        try {
            const response = await adminAuthApi.me();
            setAdmin(response.admin);
        } catch {
            setAdmin(null);
        } finally {
            setIsLoading(false);
        }
    }

    async function login(email: string, password: string) {
        setIsLoading(true);
        try {
            const response = await adminAuthApi.login(email, password);
            if (response.setupRequired) {
                return { setupRequired: true };
            }
            setAdmin(response.admin);
            router.push('/admin/dashboard');
            return { setupRequired: false };
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function setupPassword(email: string, password: string) {
        setIsLoading(true);
        try {
            console.log('[AdminContext] setupPassword called with:', email);
            const response = await adminAuthApi.setupPassword(email, password);
            console.log('[AdminContext] setupPassword response:', response);
            setAdmin(response.admin);
            console.log('[AdminContext] Admin set, navigating to dashboard...');
            router.push('/admin/dashboard');
        } catch (error) {
            console.error('[AdminContext] setupPassword error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function logout() {
        try {
            await adminAuthApi.logout();
        } catch {
            // Ignore logout errors
        }
        setAdmin(null);
        router.push('/admin/login');
    }

    return (
        <AdminContext.Provider
            value={{
                isAuthenticated: !!admin,
                isLoading,
                admin,
                login,
                setupPassword,
                logout
            }}
        >
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}
