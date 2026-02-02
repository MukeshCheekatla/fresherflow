'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { UserPlus, Loader2, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

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
            toast.success('🚀 Welcome to the future of hiring!', { id: loadingToast });
            router.push('/profile/complete');
        } catch (err: any) {
            toast.error(err.message || 'Registration failed. Please try again.', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 animate-in fade-in duration-700">
            <div className="max-w-[440px] w-full">
                {/* Brand */}
                <div className="text-center space-y-2 mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 group mb-6">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-all duration-300 shadow-xl shadow-slate-200">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-black text-3xl tracking-tighter text-slate-900">FresherFlow</span>
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Join the Flow.</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Engineering your path to a dream career.</p>
                </div>

                {/* Card */}
                <div className="glass-card rounded-[2.5rem] p-10 border border-white shadow-2xl shadow-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Full Talent Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="premium-input pl-11 py-2.5 bg-slate-50/50 border-transparent focus:bg-white"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Universal Identifier (Email)
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="premium-input pl-11 py-2.5 bg-slate-50/50 border-transparent focus:bg-white"
                                    placeholder="alex@university.edu"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Access Protocol (Password)
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="premium-input pl-11 py-2.5 bg-slate-50/50 border-transparent focus:bg-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Confirm Protocol
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="premium-input pl-11 py-2.5 bg-slate-50/50 border-transparent focus:bg-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full premium-button py-4 flex items-center justify-center gap-2 mt-4 shadow-xl shadow-slate-100"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <ArrowRight className="w-5 h-5" />
                            )}
                            {isLoading ? 'Synchronizing...' : 'Initialize Profile'}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-50">
                        <p className="text-sm font-bold text-slate-500">
                            Already in the stream?{' '}
                            <Link href="/login" className="text-slate-900 border-b-2 border-slate-900 pb-0.5 hover:text-blue-600 hover:border-blue-600 transition-all">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer Credits */}
                <div className="text-center mt-10 space-y-4 pb-10">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        FresherFlow © 2026 Engineering the Future
                    </p>
                </div>
            </div>
        </div>
    );
}
