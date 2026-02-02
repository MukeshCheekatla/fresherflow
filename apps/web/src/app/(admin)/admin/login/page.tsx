'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Lock, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const loadingToast = toast.loading('🔒 Verifying credentials...');

        try {
            const response = await fetch('http://localhost:5000/api/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Unauthorized access');
            }

            toast.success('✅ Welcome back, Admin.', { id: loadingToast });

            // Store token
            localStorage.setItem('adminToken', data.accessToken || data.token);

            // Redirect with full reload for context
            setTimeout(() => {
                window.location.href = '/admin/dashboard';
            }, 500);
        } catch (err: any) {
            toast.error(err.message || 'Login failed', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 animate-in fade-in duration-700">
            <div className="max-w-md w-full">
                {/* Brand */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-slate-200 rotate-3 transform group-hover:rotate-0 transition-transform">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                        Admin Portal
                    </h1>
                    <p className="mt-2 text-slate-500 font-medium">
                        YearHire Executive Management
                    </p>
                </div>

                {/* Card */}
                <div className="glass-card rounded-[2.5rem] p-10 border border-white shadow-2xl shadow-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                Email Identity
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="premium-input bg-white/50"
                                placeholder="admin@yearhire.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                Secure Key
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="premium-input bg-white/50"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full premium-button py-4 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <ShieldCheck className="w-5 h-5" />
                            )}
                            {isLoading ? 'Decrypting...' : 'Authorize Login'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link href="/" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to community site
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Encrypted Session Active
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
