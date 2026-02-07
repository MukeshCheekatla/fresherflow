'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
    EnvelopeIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    ChevronLeftIcon,
    KeyIcon
} from '@heroicons/react/24/outline';
import { useAuthFormData } from '@/contexts/AuthFormDataContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        google: any;
    }
}

import LoadingScreen from '@/components/ui/LoadingScreen';

type LoginStep = 'email' | 'otp';

export default function LoginPage() {
    const { email, setEmail } = useAuthFormData();
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<LoginStep>('email');
    const [isProcessing, setIsProcessing] = useState(false);
    const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

    const { sendOtp, verifyOtp, loginWithGoogle, user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Don't redirect if:
        // 1. Auth is still loading
        // 2. Logout is in progress (global flag)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isLoggingOut = typeof window !== 'undefined' && (window as any).__isLoggingOut;

        if (user && !isLoading && !isLoggingOut) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    // Check if Google script is loaded
    useEffect(() => {
        const checkGoogleScript = () => {
            if (typeof window !== 'undefined' && window.google?.accounts?.id) {
                setGoogleScriptLoaded(true);
            } else {
                setTimeout(checkGoogleScript, 100);
            }
        };
        checkGoogleScript();
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleGoogleCallback = useCallback(async (response: any) => {
        setIsProcessing(true);
        try {
            await loginWithGoogle(response.credential);
            toast.success('Welcome! Redirecting...');
            router.push('/dashboard');
        } catch (err: unknown) {
            setIsProcessing(false);
            const errorMessage = (err as Error).message || 'Google login failed.';
            toast.error(errorMessage);
        }
    }, [loginWithGoogle, router]);

    // Initialize Google Login - robust version with cleanup
    useEffect(() => {
        if (step !== 'email' || !googleScriptLoaded) return;

        let mounted = true;
        const googleBtnId = 'google-login-btn';

        const initGoogle = () => {
            if (!mounted) return;

            const googleBtn = document.getElementById(googleBtnId);
            if (!googleBtn) {
                setTimeout(initGoogle, 100);
                return;
            }

            try {
                googleBtn.innerHTML = '';
                window.google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                    callback: handleGoogleCallback,
                    auto_select: false,
                });

                window.google.accounts.id.renderButton(googleBtn, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'continue_with',
                    shape: 'rectangular',
                    logo_alignment: 'center',
                    width: '400',
                });
                // Google button rendered successfully
            } catch (err) {
                console.error('[Google] Render failed:', err);
            }
        };

        const timer = setTimeout(initGoogle, 150);
        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, [step, googleScriptLoaded, handleGoogleCallback]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        const loadingToast = toast.loading('Sending verification code...');
        try {
            await sendOtp(email);
            toast.success('Code sent to your email!', { id: loadingToast });
            setStep('otp');
        } catch (err: unknown) {
            toast.error((err as Error).message || 'Failed to send code.', { id: loadingToast });
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            await verifyOtp(email, otp);
            router.push('/dashboard');
        } catch (err: unknown) {
            setIsProcessing(false);
            toast.error((err as Error).message || 'Invalid or expired code.');
        }
    };

    if (isProcessing) return <LoadingScreen />;

    return (
        <div className="flex-1 flex flex-col md:flex-row bg-background overflow-hidden relative min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-80px)]">
            {/* Left Side: Hero (Desktop Only) */}
            <div className="hidden md:flex md:w-[45%] lg:w-[50%] bg-muted/30 border-r border-border relative overflow-hidden flex-col items-center justify-center p-12 text-center">
                <div className="space-y-6 max-w-sm animate-in fade-in slide-in-from-left-6 duration-500">
                    <h2 className="text-4xl font-bold tracking-tight text-foreground">
                        The definitive career protocol.
                    </h2>
                    <p className="text-base text-muted-foreground leading-relaxed">
                        Access a verified feed of off-campus jobs, internships, and walk-ins. Built for the modern engineer.
                    </p>
                </div>
                {/* Decorative Element */}
                <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-6 md:px-20 bg-background relative overflow-hidden">
                <div className="max-w-[400px] mx-auto w-full space-y-6 md:space-y-10">

                    {/* Form Header */}
                    <div className="space-y-2 text-center md:text-left">
                        {step !== 'email' && (
                            <button
                                onClick={() => setStep('email')}
                                className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-primary uppercase tracking-wider mb-4 transition-colors"
                            >
                                <ChevronLeftIcon className="w-3 h-3" />
                                Back to login
                            </button>
                        )}
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {step === 'otp' ? 'Verify identity' : 'Sign in'}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {step === 'otp' ? `We sent a code to ${email}` : 'Enter your email to access your feed'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Step 1: Email Input */}
                        {step === 'email' && (
                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-foreground ml-1">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors z-10" />
                                        <Input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-12 !h-12 text-sm"
                                            placeholder="name@company.com"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="w-full !h-12 text-sm font-semibold !rounded-lg"
                                >
                                    {isLoading ? (
                                        <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto" />
                                    ) : (
                                        "Continue"
                                    )}
                                </Button>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-border"></span>
                                    </div>
                                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-semibold">
                                        <span className="bg-background px-4 text-muted-foreground/40">or</span>
                                    </div>
                                </div>

                                <div id="google-login-btn" className="w-full min-h-[48px] overflow-hidden rounded-lg"></div>
                            </form>
                        )}

                        {/* Step 2: OTP Verification */}
                        {step === 'otp' && (
                            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-foreground ml-1">
                                        Verification Code
                                    </label>
                                    <div className="relative group">
                                        <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors z-10" />
                                        <Input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="pl-12 !h-12 text-center text-xl font-bold tracking-[0.4em]"
                                            placeholder="000000"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-[11px] text-muted-foreground">
                                            Didn&apos;t receive it?
                                        </p>
                                        <button type="button" onClick={handleSendOtp} className="text-[11px] font-semibold text-primary hover:underline">
                                            Resend code
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading || otp.length !== 6}
                                    className="w-full !h-12 text-sm font-semibold !rounded-lg"
                                >
                                    {isLoading ? (
                                        <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto" />
                                    ) : (
                                        "Verify code"
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="pt-12 border-t border-border/50">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                                <ShieldCheckIcon className="w-4 h-4 text-success/60" />
                                <span>Verified Infrastructure</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
