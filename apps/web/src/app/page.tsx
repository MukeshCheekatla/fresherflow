'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
    BriefcaseIcon,
    ArrowRightIcon,
    BoltIcon,
    ShieldCheckIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (!isLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
            {/* Hero Section */}
            <section className="relative pt-12 pb-8 md:pt-16 md:pb-12 overflow-hidden">
                <div className="max-content relative z-10 text-center space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-card rounded-full border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Entry-Level Career Stream</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            Find Your First Job, <br />
                            <span className="text-muted-foreground">Internship, or Walk-In.</span>
                        </h1>

                        <p className="text-sm md:text-base text-muted-foreground font-medium max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200 leading-relaxed">
                            Browse fresher-friendly opportunities in one place. <br className="hidden md:block" />
                            Create your account to get started.
                        </p>
                    </div>

                    {/* Primary CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
                        <Link href="/register" className="premium-button w-full sm:w-auto px-8">
                            Create Account
                            <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                        <Link href="/login" className="premium-button-outline w-full sm:w-auto px-8">
                            Sign In
                        </Link>
                    </div>

                    <p className="text-[10px] font-medium text-muted-foreground animate-in fade-in duration-700 delay-400">
                        No credit card required • Free forever • 2 minutes to start
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-primary/5 via-background to-accent/5 rounded-full blur-3xl -z-10" />
            </section>

            {/* Why FresherFlow */}
            <section className="bg-card py-12 md:py-16 border-y border-border">
                <div className="max-content">
                    <div className="text-center mb-8 space-y-2">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">The Philosophy</p>
                        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Why FresherFlow?</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {[
                            { icon: BriefcaseIcon, title: 'Entry-Level Focus', text: 'Curated opportunities specifically for freshers and entry-level candidates.' },
                            { icon: ShieldCheckIcon, title: 'Verified Listings', text: 'All opportunities are reviewed and verified before publishing.' },
                            { icon: ChartBarIcon, title: 'Simple Workflow', text: 'Browse, read details, and apply in just a few clicks.' }
                        ].map((feature, i) => (
                            <div key={i} className="premium-card text-center space-y-3 group hover:border-primary/20 p-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-base font-bold text-foreground">{feature.title}</h3>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{feature.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-12 md:py-16 bg-background">
                <div className="max-content">
                    <div className="text-center mb-8 space-y-2">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">The Process</p>
                        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">How it works.</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {[
                            { num: '1', title: 'Create Account', text: 'Sign up in under 2 minutes with just your email.' },
                            { num: '2', title: 'Browse Opportunities', text: 'Explore jobs, internships, and walk-in drives matched to your profile.' },
                            { num: '3', title: 'Apply Directly', text: 'Use provided links or walk-in information to take the next step.' }
                        ].map((step, i) => (
                            <div key={i} className="relative">
                                <div className="flex flex-col items-center text-center space-y-3">
                                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-black text-lg text-primary-foreground shadow">
                                        {step.num}
                                    </div>
                                    <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{step.text}</p>
                                </div>
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-5 left-[60%] w-[80%] h-[1px] bg-border" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-12 md:py-16 bg-primary text-primary-foreground">
                <div className="max-content text-center space-y-6">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-inherit">Ready to start your career journey?</h2>
                    <p className="text-sm md:text-base opacity-90 max-w-xl mx-auto">
                        Join thousands of freshers who found their first opportunity through FresherFlow.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto pt-2">
                        <Link href="/register" className="premium-button bg-background !text-foreground hover:opacity-90 w-full sm:w-auto px-8">
                            Get Started Now
                            <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                        <Link href="/login" className="premium-button-outline border-white/30 text-white hover:bg-white/10 w-full sm:w-auto px-8">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-card py-8 border-t border-border">
                <div className="max-content">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex flex-col items-center md:items-start gap-1">
                            <div className="flex items-center gap-2">
                                <BriefcaseIcon className="w-5 h-5 text-foreground" />
                                <span className="font-black text-lg tracking-tighter text-foreground">FresherFlow</span>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">Discover entry-level opportunities with clarity.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors">Privacy</Link>
                            <Link href="/terms" className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors">Terms</Link>
                            <Link href="/login" className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors">Admin</Link>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border text-center">
                        <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider">© 2026 FresherFlow. Built for Freshers.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
