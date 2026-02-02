'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
    UserPlusIcon,
    ArrowPathIcon,
    EnvelopeIcon,
    LockClosedIcon,
    UserIcon,
    ArrowRightIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (password !== confirmPassword) {
            toast.error('❌ Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('❌ Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('🛰️ Creating your profile...');

        try {
            await register(email, password, fullName);
            toast.success('Welcome to the future of hiring!', { id: loadingToast });
            router.push('/profile/complete');
        } catch (err: any) {
            toast.error(err.message || 'Registration failed. Please try again.', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-dvh flex items-center justify-center bg-background px-4 animate-in fade-in duration-700">
            <div className="max-w-[400px] w-full py-6">
                {/* Brand */}
                <div className="text-center space-y-3 mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 group mb-3">
                        <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center group-hover:rotate-6 transition-all duration-300 shadow-xl">
                            <BriefcaseIcon className="w-5 h-5 text-background" />
                        </div>
                        <span className="font-black text-xl tracking-tighter text-foreground uppercase">FresherFlow</span>
                    </Link>
                    <h2 className="tracking-tighter !text-2xl">Join the Stream.</h2>
                    <p className="text-muted-foreground font-medium tracking-tight text-sm">Create your account and access verified opportunities.</p>
                </div>

                {/* Card */}
                <div className="glass-card rounded-[2rem] p-6 md:p-7 border border-border shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="premium-input pl-11 py-2.5"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

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
                                    className="premium-input pl-11 py-2.5"
                                    placeholder="alex@university.edu"
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
                                    className="premium-input pl-11 py-2.5"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="premium-input pl-11 py-2.5"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full premium-button mt-2"
                        >
                            {isLoading ? (
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            ) : (
                                <ArrowRightIcon className="w-4 h-4" />
                            )}
                            {isLoading ? 'Synchronizing...' : 'Initialize Profile'}
                        </button>
                    </form>

                    <div className="mt-7 text-center pt-5 border-t border-border">
                        <p className="text-sm font-bold text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="text-foreground hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer Credits */}
                <div className="text-center mt-6">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        FresherFlow © 2026 Engineering the Future
                    </p>
                </div>
            </div>
        </div>
    );
}
