'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminAuthApi } from '@/lib/api/client';
import { useRouter, usePathname } from 'next/navigation';

interface AdminContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    admin: any | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Check admin session on mount
    useEffect(() => {
        checkAdminSession();
    }, []);

    async function checkAdminSession() {
        try {
            const response = await adminAuthApi.me();
            setAdmin(response.admin);
        } catch (error) {
            setAdmin(null);
        } finally {
            setIsLoading(false);
        }
    }

    async function login(email: string, password: string) {
        setIsLoading(true);
        try {
            const response = await adminAuthApi.login(email, password);
            setAdmin(response.admin);
            router.push('/admin/dashboard');
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function logout() {
        try {
            await adminAuthApi.logout();
        } catch (e) {
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
