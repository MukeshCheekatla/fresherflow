'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
    EnvelopeIcon,
    LockClosedIcon,
    UserIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAuthFormData } from '@/contexts/AuthFormDataContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
    const { email, setEmail, fullName, setFullName } = useAuthFormData();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const strength = useMemo(() => {
        if (!password) return 0;
        let s = 0;
        if (password.length > 6) s++;
        if (password.length > 10) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return Math.min(4, Math.floor(s * 0.8) + 1);
    }, [password]);

    const strengthConfig = [
        { label: 'Weak', color: 'bg-error' },
        { label: 'Fair', color: 'bg-warning' },
        { label: 'Good', color: 'bg-amber-500' },
        { label: 'Strong', color: 'bg-success' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            setIsLoading(false);
            return;
        }

        const loadingToast = toast.loading('Initializing profile...');

        try {
            await register(email, password, fullName);
            toast.success('Welcome to the flow!', { id: loadingToast });
            router.push('/profile/complete');
        } catch (err: unknown) {
            toast.error((err as Error).message || 'Registration failed.', { id: loadingToast });
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
                        Connect.
                        <br />
                        <span className="text-primary">Verify.</span>
                        <br />
                        Succeed.
                    </h2>
                    <p className="text-base font-medium text-muted-foreground leading-relaxed italic uppercase tracking-wider opacity-80">
                        Join the most accurate career feed for freshers. One account, direct access to verified jobs.
                    </p>

                    <div className="pt-8 flex justify-center opacity-30">
                        <div className="h-[1px] w-20 bg-foreground" />
                    </div>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="flex-1 flex flex-col justify-center px-4 py-2 md:px-20 bg-background relative overflow-hidden">
                <div className="max-w-[400px] mx-auto w-full space-y-4">
                    <div className="space-y-0.5 text-center md:text-left">
                        <h1 className="text-2xl font-black tracking-tight text-foreground uppercase italic leading-none">
                            Join Now
                        </h1>
                        <p className="text-muted-foreground font-semibold uppercase text-xs tracking-widest">
                            Create your professional identity.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Full Name
                            </label>
                            <div className="relative group">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                                <Input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="pl-11"
                                    placeholder="EX: JOHN DOE"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                                <Input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-11"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                                    Create Password
                                </label>
                                {password && (
                                    <div className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white transition-all",
                                        strengthConfig[strength - 1]?.color
                                    )}>
                                        {strengthConfig[strength - 1]?.label}
                                    </div>
                                )}
                            </div>
                            <div className="relative group">
                                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-11 pr-11"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors z-10 p-1"
                                >
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="flex gap-1 px-1 h-1.5 mt-2">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex-1 rounded-full transition-all duration-500",
                                            i < strength ? strengthConfig[strength - 1].color : "bg-muted-foreground/10"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-11 pr-11"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors z-10 p-1"
                                >
                                    {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-4 font-black uppercase tracking-widest italic"
                        >
                            {isLoading ? (
                                <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Member already?{' '}
                            <Link href="/login" className="text-primary hover:underline font-black ml-1">
                                Sign In
                            </Link>
                        </p>
                    </div>

                    <div className="flex justify-center pt-2">
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                            <ShieldCheckIcon className="w-3.5 h-3.5 text-primary/50" />
                            <span>Verified Entry</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

