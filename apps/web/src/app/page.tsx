'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
    BriefcaseIcon,
    RocketLaunchIcon,
    ShieldCheckIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    return (
        <div className="h-screen bg-background flex flex-col selection:bg-primary/20 overflow-hidden">
            {/* Ultra-Minimal Landing */}
            <main className="flex-1 flex flex-col items-center justify-center pt-[10vh] md:pt-0 p-4 text-center max-w-4xl mx-auto space-y-4 md:space-y-6">

                {/* Status Indicator */}
                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted border border-border rounded-full">
                        <div className="w-1 h-1 rounded-full bg-success" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Free for Freshers</span>
                    </div>
                </div>

                {/* Core Identity */}
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
                    <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                        Fresher<span className="text-primary">Flow</span>
                    </h1>
                    <p className="text-[10px] md:text-base text-muted-foreground font-medium uppercase tracking-[0.2em] max-w-xl mx-auto">
                        A Good and Free Career Feed for Freshers.
                    </p>
                </div>

                {/* Primary Interaction */}
                <div className="flex flex-row items-center justify-center gap-3 pt-2 animate-in fade-in zoom-in-95 duration-1000 delay-300">
                    <Link href="/register?mode=register" className="premium-button !h-[48px] md:!h-[52px] px-6 md:px-10 text-[11px] md:text-sm">
                        Join Now
                    </Link>
                    <Link href="/login" className="premium-button-outline !h-[48px] md:!h-[52px] px-6 md:px-10 text-[11px] md:text-sm hover:bg-muted/50 transition-all">
                        Sign In
                    </Link>
                </div>

                {/* Simple Features */}
                <div className="pt-12 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 opacity-60 animate-in fade-in duration-1000 delay-500">
                    <div className="flex flex-col items-center gap-2">
                        <ShieldCheckIcon className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">Verified Jobs</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <BriefcaseIcon className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">100% Free</span>
                    </div>
                    <div className="hidden md:flex flex-col items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">Apply Directly</span>
                    </div>
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="hidden md:block p-6 border-t border-border/50 text-center">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.5em] opacity-30">
                    © 2026 FresherFlow
                </p>
            </footer>
        </div>
    );
}
