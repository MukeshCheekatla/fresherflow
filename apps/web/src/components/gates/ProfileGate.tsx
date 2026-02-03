'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Profile Gate - Shows friendly message if profile incomplete
 * Use this to wrap pages that require complete profile
 */
export function ProfileGate({ children }: { children: React.ReactNode }) {
    const { profile, isLoading } = useAuth();
    const router = useRouter();
    const [countdown, setCountdown] = useState(3);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    // Check if profile is incomplete
    useEffect(() => {
        if (!isLoading && profile && profile.completionPercentage < 100) {
            setShouldRedirect(true);
        }
    }, [profile, isLoading]);

    // Handle countdown timer
    useEffect(() => {
        if (shouldRedirect && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [shouldRedirect, countdown]);

    // Handle redirect when countdown reaches 0
    useEffect(() => {
        if (shouldRedirect && countdown === 0) {
            router.push('/profile/complete');
        }
    }, [shouldRedirect, countdown, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (profile && profile.completionPercentage < 100) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="premium-card max-w-md w-full p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <ExclamationTriangleIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tight">Profile Not Complete!</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Please complete your profile to access this feature. We need a few more details to personalize your experience.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <Link href="/profile/complete" className="premium-button w-full">
                            Complete Profile Now
                        </Link>
                        <p className="text-xs text-muted-foreground">
                            Auto-redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                        </p>
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

