'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
    EnvelopeIcon,
    LockClosedIcon,
    ArrowRightIcon,
    BriefcaseIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    UserIcon,
    CheckCircleIcon,
    ChartBarIcon,
    GlobeAltIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'register';

function AuthContent() {
    const searchParams = useSearchParams();
    const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, register, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleSwitch = (newMode: AuthMode) => {
        setMode(newMode);
        // Clear errors/state if needed
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const loadingToast = toast.loading(mode === 'login' ? '🚀 Verifying credentials...' : '🛰️ Initializing profile...');

        try {
            if (mode === 'login') {
                await login(email, password);
                toast.success('Welcome back to FresherFlow!', { id: loadingToast });
                router.push('/dashboard');
            } else {
                if (password !== confirmPassword) {
                    toast.error('❌ Passwords do not match', { id: loadingToast });
                    setIsLoading(false);
                    return;
                }
                if (password.length < 6) {
                    toast.error('❌ Password security threshold not met (min 6 chars)', { id: loadingToast });
                    setIsLoading(false);
                    return;
                }
                await register(email, password, fullName);
                toast.success('Welcome to the flow!', { id: loadingToast });
                router.push('/profile/complete');
            }
        } catch (err: any) {
            toast.error(err.message || 'Authentication protocol failed.', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col md:flex-row bg-background overflow-hidden">
            {/* Left Side: Hero Card (Desktop Only) */}
            <div className="hidden md:flex md:w-[45%] lg:w-[50%] bg-muted/30 border-r border-border relative overflow-hidden flex-col justify-between p-10 text-foreground">
                <div className="relative z-10">
                    {/* Brand logo removed - already in Navbar */}

                    <div className="space-y-6 max-w-lg">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none uppercase italic">
                            Aggregate.
                            <br />
                            Verify.
                            <br />
                            Deploy.
                        </h2>
                        <p className="text-base font-medium text-muted-foreground leading-relaxed italic">
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
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-border pt-8 opacity-40">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">© 2026 FresherFlow</p>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-8 md:px-20 bg-background relative overflow-y-auto md:overflow-hidden">
                {/* Mobile Identity */}
                {/* Mobile Identity removed - already in Navbar */}

                <div className="max-w-[400px] mx-auto w-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-foreground uppercase italic leading-none">
                            {mode === 'login' ? 'System Login' : 'Initialize Protocol'}
                        </h2>
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
                            {mode === 'login' ? 'Execute session authentication.' : 'Create new authenticated identity.'}
                        </p>
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex p-1 bg-muted rounded-xl border border-border">
                        <button
                            onClick={() => handleSwitch('login')}
                            className={cn(
                                "flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
                                mode === 'login' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => handleSwitch('register')}
                            className={cn(
                                "flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
                                mode === 'register' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        {mode === 'register' && (
                            <div className="space-y-2 animate-in fade-in duration-300">
                                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                                    Full Identity Name
                                </label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="premium-input !h-12 pl-12"
                                        placeholder="EX: JOHN DOE"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="premium-input !h-12 pl-12"
                                    placeholder="IDENTITY@DOMAIN.COM"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Access Password
                            </label>
                            <div className="relative group">
                                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="premium-input !h-12 pl-12"
                                    placeholder="••••••••"
                                />
                            </div>
                            {mode === 'login' && (
                                <div className="flex justify-end pr-1">
                                    <Link href="#" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                                        Forgot access password?
                                    </Link>
                                </div>
                            )}
                        </div>

                        {mode === 'register' && (
                            <div className="space-y-2 animate-in fade-in duration-300">
                                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                                    Confirm Security Key
                                </label>
                                <div className="relative group">
                                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="premium-input !h-12 pl-12"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full premium-button !h-12 text-sm uppercase font-black tracking-widest active:scale-[0.98] transition-all"
                        >
                            {isLoading ? (
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            ) : (
                                <div className="flex items-center justify-center">
                                    <span>{mode === 'login' ? 'Execute Auth' : 'Initialize Identity'}</span>
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Footer elements removed for extreme minimalism */}
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

