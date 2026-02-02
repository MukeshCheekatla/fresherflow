'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
    EnvelopeIcon,
    LockClosedIcon,
    ArrowRightIcon,
    BriefcaseIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const loadingToast = toast.loading('🚀 Launching your session...');

        try {
            await login(email, password);
            toast.success('Welcome back to the Flow!', { id: loadingToast });
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Login failed. Please check your credentials.', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-dvh flex items-center justify-center bg-background px-4 animate-in fade-in duration-700">
            <div className="max-w-[380px] w-full py-8">
                {/* Brand */}
                <div className="text-center space-y-3 mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 group mb-4">
                        <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center group-hover:rotate-6 transition-all duration-300 shadow-xl">
                            <BriefcaseIcon className="w-5 h-5 text-background" />
                        </div>
                        <span className="font-black text-xl tracking-tighter text-foreground uppercase">FresherFlow</span>
                    </Link>
                    <h2 className="tracking-tighter !text-2xl">Welcome Back.</h2>
                    <p className="text-muted-foreground font-medium tracking-tight text-sm">Access your optimized opportunity stream.</p>
                </div>

                {/* Card */}
                <div className="glass-card rounded-[2rem] p-6 md:p-8 border border-border shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="premium-input pl-11"
                                    placeholder="alex@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="premium-input pl-11"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full premium-button"
                        >
                            {isLoading ? (
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            ) : (
                                <ArrowRightIcon className="w-4 h-4" />
                            )}
                            {isLoading ? 'Authenticating...' : 'Enter Dashboard'}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-border">
                        <p className="text-sm font-bold text-muted-foreground">
                            New here?{' '}
                            <Link href="/register" className="text-foreground hover:underline">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer Credits */}
                <div className="text-center mt-8 space-y-3">
                    <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">
                        FresherFlow © 2026 Secure Authentication
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/privacy" className="text-[10px] font-bold text-muted-foreground hover:text-foreground">Privacy</Link>
                        <Link href="/terms" className="text-[10px] font-bold text-muted-foreground hover:text-foreground">Terms</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
