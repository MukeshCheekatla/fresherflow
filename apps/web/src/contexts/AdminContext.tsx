'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
    logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Initialize token synchronously to avoid race condition
const getInitialToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('adminToken');
    }
    return null;
};

export function AdminProvider({ children }: { children: ReactNode }) {
    // Load token synchronously on mount to prevent race condition
    const [token, setToken] = useState<string | null>(getInitialToken);
    const [isLoading, setIsLoading] = useState(false);

    // Listen for token changes in localStorage (e.g., from login page)
    useEffect(() => {
        const handleStorageChange = () => {
            const savedToken = localStorage.getItem('adminToken');
            setToken(savedToken);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const logout = () => {
        setToken(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
        }
    };

    return (
        <AdminContext.Provider value={{ isAuthenticated: !!token, isLoading, token, logout }}>
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

