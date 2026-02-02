'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { LogIn, Loader2, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

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
            toast.success('✨ Welcome back to the Flow!', { id: loadingToast });
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Login failed. Please check your credentials.', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 animate-in fade-in duration-700">
            <div className="max-w-[440px] w-full">
                {/* Brand */}
                <div className="text-center space-y-2 mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 group mb-6">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-all duration-300 shadow-xl shadow-slate-200">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-black text-3xl tracking-tighter text-slate-900">FresherFlow</span>
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Welcome Back.</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Access your optimized opportunity stream.</p>
                </div>

                {/* Card */}
                <div className="glass-card rounded-[2.5rem] p-10 border border-white shadow-2xl shadow-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
                            className="w-full premium-button py-4 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <ArrowRight className="w-5 h-5" />
                            )}
                            {isLoading ? 'Authenticating...' : 'Enter Dashboard'}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-50">
                        <p className="text-sm font-bold text-slate-400">
                            New here?{' '}
                            <Link href="/register" className="text-slate-900 hover:underline">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer Credits */}
                <div className="text-center mt-10 space-y-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        FresherFlow © 2026 Secure Authentication
                    </p>
                    <div className="flex items-center justify-center gap-6">
                        <Link href="/privacy" className="text-xs font-bold text-slate-400 hover:text-slate-900">Privacy</Link>
                        <Link href="/terms" className="text-xs font-bold text-slate-400 hover:text-slate-900">Terms</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
