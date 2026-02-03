'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAdmin } from '@/contexts/AdminContext';
import {
    LockClosedIcon,
    ShieldCheckIcon,
    ArrowLeftIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Use Context
    const { login, isLoading } = useAdmin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        const loadingToast = toast.loading('🔒 Verifying credentials...');

        try {
            await login(email, password);
            toast.success('✅ Welcome back, Admin.', { id: loadingToast });
            // Redirect handled by Context (router.push)
        } catch (err: any) {
            toast.error(err.message || 'Login failed', { id: loadingToast });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 animate-in fade-in duration-700">
            <div className="max-w-[440px] w-full">
                {/* Brand */}
                <div className="text-center mb-10 space-y-4">
                    <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20 rotate-3 transform hover:rotate-0 transition-all duration-500">
                        <LockClosedIcon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="tracking-tighter text-2xl font-bold text-foreground">
                        Admin Portal
                    </h1>
                    <p className="text-muted-foreground font-medium tracking-tight">
                        Executive Management Interface
                    </p>
                </div>

                {/* Card */}
                <div className="bg-card rounded-[2.5rem] p-10 border border-border shadow-2xl shadow-black/5">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Email Identity
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="premium-input bg-background w-full p-3 border rounded-xl"
                                placeholder="admin@fresherflow.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Secure Key
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="premium-input bg-background w-full p-3 border rounded-xl"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full premium-button h-[56px] flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            {isLoading ? (
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            ) : (
                                <ShieldCheckIcon className="w-5 h-5" />
                            )}
                            {isLoading ? 'Decrypting...' : 'Authorize Login'}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-border">
                        <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
                            <ArrowLeftIcon className="w-4 h-4" />
                            Back to community site
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border shadow-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Encrypted Session Active
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
