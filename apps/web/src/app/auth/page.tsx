'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
    EnvelopeIcon,
    LockClosedIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const AuthContent = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const loadingToast = toast.loading('🚀 Verifying credentials...');

        try {
            await login(email, password);
            toast.success('Welcome back to FresherFlow!', { id: loadingToast });
            router.push('/dashboard');
        } catch (err: unknown) {
            toast.error((err as Error).message || 'Authentication protocol failed.', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col md:flex-row bg-background overflow-hidden">
            {/* Left Side: Hero Card (Desktop Only) */}
            <div className="hidden md:flex md:w-[45%] lg:w-[50%] bg-muted/30 border-r border-border relative overflow-hidden flex-col justify-between p-10 text-foreground">
                <div className="relative z-10">
                    <div className="space-y-6 max-w-lg">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-none uppercase">
                            Aggregate.
                            <br />
                            Verify.
                            <br />
                            Deploy.
                        </h2>
                        <p className="text-base font-medium text-muted-foreground leading-relaxed">
                            The centralized architecture for entry-level careers. Pure engineering, factual data, zero friction.
                        </p>

                        <div className="space-y-4 pt-4">
                            {[
                                { icon: GlobeAltIcon, text: 'Real-time feed synchronization.' },
                                { icon: ShieldCheckIcon, text: '100% manual verification protocol.' },
                                { icon: SparklesIcon, text: 'Direct-to-company application paths.' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="p-2 bg-background border border-border rounded-lg group-hover:border-primary/50 transition-colors">
                                        <item.icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-border pt-8 opacity-40">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">© 2026 FresherFlow</p>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-8 md:px-20 bg-background relative overflow-y-auto md:overflow-hidden">
                <div className="max-w-[400px] mx-auto w-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground uppercase leading-none">
                            System Login
                        </h2>
                        <p className="text-muted-foreground font-semibold uppercase text-[10px] tracking-[0.2em]">
                            Execute session authentication.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em] ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="premium-input !h-12 pl-12 text-sm"
                                    placeholder="Your registered email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em] ml-1">
                                Access Password
                            </label>
                            <div className="relative group">
                                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="premium-input !h-12 pl-12 text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex justify-end pr-1">
                                <Link href="#" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                                    Forgot access password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full premium-button !h-12 text-sm uppercase font-bold tracking-[0.15em] active:scale-[0.98] transition-all mt-4"
                        >
                            {isLoading ? (
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            ) : (
                                <div className="flex items-center justify-center">
                                    <span>Execute Auth Flow</span>
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full bg-background flex items-center justify-center"><ArrowPathIcon className="w-6 h-6 animate-spin text-muted-foreground" /></div>}>
            <AuthContent />
        </Suspense>
    );
}
