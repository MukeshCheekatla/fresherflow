'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
    EnvelopeIcon,
    LockClosedIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useAuthFormData } from '@/contexts/AuthFormDataContext';

export default function LoginPage() {
    const { email, setEmail } = useAuthFormData();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
        const loadingToast = toast.loading('Securing session...');

        try {
            await login(email, password);
            toast.success('Welcome back!', { id: loadingToast });
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Authentication failed.', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col md:flex-row bg-background overflow-hidden relative min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-80px)]">
            {/* Left Side: Hero (Desktop Only) */}
            <div className="hidden md:flex md:w-[45%] lg:w-[50%] bg-muted/30 border-r border-border relative overflow-hidden flex-col items-center justify-center p-12 text-center">
                <div className="space-y-6 max-w-sm animate-in fade-in slide-in-from-left-6 duration-1000">
                    <h2 className="text-5xl lg:text-6xl font-black tracking-tighter leading-none uppercase italic text-foreground">
                        Simplify.
                        <br />
                        <span className="text-primary">Deploy.</span>
                        <br />
                        Succeed.
                    </h2>
                    <p className="text-base font-medium text-muted-foreground leading-relaxed italic uppercase tracking-wider opacity-80">
                        Hand-verified opportunities for the next generation of engineers.
                    </p>

                    <div className="pt-8 flex justify-center opacity-30">
                        <div className="h-[1px] w-20 bg-foreground" />
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-4 md:px-20 bg-background relative overflow-hidden">
                <div className="max-w-[400px] mx-auto w-full space-y-6">
                    <div className="space-y-1 text-center md:text-left">
                        <h1 className="text-2xl font-black tracking-tight text-foreground uppercase italic leading-none">
                            Sign In
                        </h1>
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest text-foreground/60">
                            Access your personalized career feed.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                                    Password
                                </label>
                            </div>
                            <div className="relative group">
                                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="premium-input !h-12 pl-12 pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="flex justify-end px-1">
                                <Link href="#" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full premium-button !h-12 text-sm font-black uppercase tracking-widest active:scale-[0.98] transition-all"
                        >
                            {isLoading ? (
                                <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                "Execute Login"
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            New here?{' '}
                            <Link href="/register" className="text-primary hover:underline font-black">
                                Join Now
                            </Link>
                        </p>
                    </div>

                    <div className="flex justify-center pt-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                            <ShieldCheckIcon className="w-4 h-4 text-primary/50" />
                            <span>Verified Session</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

