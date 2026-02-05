'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Profile Gate - Shows friendly message if profile incomplete
 * Use this to wrap pages that require complete profile
 */
export function ProfileGate({ children }: { children: React.ReactNode }) {
    const { profile, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Don't redirect if already on profile pages
    const isOnProfilePage = pathname?.startsWith('/profile/');

    useEffect(() => {
        if (!isLoading && profile) {
            console.log(`[ProfileGate] Completion: ${profile.completionPercentage}% | Path: ${pathname}`);
            if (profile.completionPercentage < 100 && !isOnProfilePage) {
                console.log('[ProfileGate] Redirecting to completion page...');
                router.push('/profile/complete');
            }
        }
    }, [profile, isLoading, pathname, router, isOnProfilePage]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (profile && profile.completionPercentage < 100 && !isOnProfilePage) {
        return (
            <div className="flex items-center justify-center min-h-screen p-6">
                <div className="premium-card max-w-sm w-full p-6 md:p-8 text-center space-y-4 md:space-y-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <ExclamationTriangleIcon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    </div>
                    <div className="space-y-1 md:space-y-2">
                        <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight">Profile Incomplete</h2>
                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed px-2">
                            Please complete your profile details to unlock all verified features.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <Link href="/profile/complete" className="premium-button w-full">
                            Complete Profile Now
                        </Link>
                    </div>
                </div>
            </div>
        );
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
            <div className="flex items-center justify-center min-h-[60vh] py-12">
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

