'use client';

import { cn } from '@/lib/utils';

interface LoadingScreenProps {
    message?: string;
    fullScreen?: boolean;
    className?: string;
}

export default function LoadingScreen({
    message = "Loading...",
    fullScreen = true,
    className
}: LoadingScreenProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center bg-neutral-50/80 backdrop-blur-sm z-50",
            fullScreen ? "fixed inset-0" : "absolute inset-0 min-h-[400px]",
            className
        )}>
            <div className="relative flex items-center justify-center">
                {/* Brand Pulsate Effect */}
                <div className="absolute w-20 h-20 bg-primary/20 rounded-full animate-ping" />

                {/* Spinner */}
                <div className="w-12 h-12 border-4 border-neutral-200 border-t-primary rounded-full animate-spin relative" />
            </div>

            {message && (
                <div className="mt-6 text-center animate-pulse">
                    <p className="text-lg font-bold text-neutral-900">{message}</p>
                    <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest font-semibold">FresherFlow</p>
                </div>
            )}
        </div>
    );
}

