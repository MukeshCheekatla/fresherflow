'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Profile Gate - Redirects to profile completion if < 100%
 * Use this to wrap pages that require complete profile
 */
export function ProfileGate({ children }: { children: React.ReactNode }) {
    const { profile, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && profile && profile.completionPercentage < 100) {
            router.push('/profile/complete');
        }
    }, [profile, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (profile && profile.completionPercentage < 100) {
        return null; // Will redirect
    }

    return <>{children}</>;
}

/**
 * Auth Gate - Redirects to login if not authenticated
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return <>{children}</>;
}
