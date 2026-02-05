'use client';

import { useState } from 'react';
import { adminAuthApi } from '@/lib/api/client';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import {
    ShieldCheckIcon,
    FingerPrintIcon
} from '@heroicons/react/24/outline';

export default function AdminLoginPage() {
    const ADMIN_EMAIL = 'cheekatlamukesh+admin@gmail.com'; // Must match ADMIN_EMAIL in apps/api/.env
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleLogin = async (e: React.FormEvent, useAdminEmail = false) => {
        e.preventDefault();
        setIsLoading(true);

        const loginEmail = useAdminEmail ? ADMIN_EMAIL : email;

        // Validate email only for manual form submit
        if (!useAdminEmail && !loginEmail) {
            toast.error('Please enter your admin email');
            setIsLoading(false);
            return;
        }

        try {
            // 1. Get options from backend
            const options = await adminAuthApi.getLoginOptions(loginEmail);

            if ('registrationRequired' in options && options.registrationRequired) {
                toast.success('Admin email recognized. Starting first-time passkey registration...');
                setIsRegistering(true);
                await handleRegistration(loginEmail);
                return;
            }

            // 2. Start WebAuthn authentication
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const asseResp = await startAuthentication({ optionsJSON: options as any });

            // 3. Verify on backend
            const verification = await adminAuthApi.verifyLogin(loginEmail, asseResp);

            if (verification.verified) {
                toast.success('Authenticated successfully!');
                setTimeout(() => {
                    window.location.href = '/admin/dashboard';
                }, 500);
            } else {
                toast.error('Authentication failed.');
            }
        } catch (err: unknown) {
            console.error('[Admin Login Error]', err);
            const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
            toast.error(message);
            setIsLoading(false);
        }
    };

    const handleQuickLogin = async () => {
        setIsLoading(true);

        try {
            // 1. Get options from backend
            const options = await adminAuthApi.getLoginOptions(ADMIN_EMAIL);

            if ('registrationRequired' in options && options.registrationRequired) {
                toast.success('Starting first-time passkey registration...');
                setIsRegistering(true);
                await handleRegistration(ADMIN_EMAIL);
                return;
            }

            // 2. Start WebAuthn authentication
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const asseResp = await startAuthentication({ optionsJSON: options as any });

            // 3. Verify on backend
            const verification = await adminAuthApi.verifyLogin(ADMIN_EMAIL, asseResp);

            if (verification.verified) {
                toast.success('Authenticated successfully!');
                setTimeout(() => {
                    window.location.href = '/admin/dashboard';
                }, 500);
            } else {
                toast.error('Authentication failed.');
            }
        } catch (err: unknown) {
            console.error('[Quick Login Error]', err);
            const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
            toast.error(message);
            setIsLoading(false);
        }
    };

    const handleRegistration = async (registrationEmail: string) => {
        try {
            console.log('[Registration] Starting for:', registrationEmail);

            // 1. Get registration options
            const options = await adminAuthApi.getRegistrationOptions(registrationEmail);

            // 2. Start WebAuthn registration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const regResp = await startRegistration({ optionsJSON: options as any });

            // 3. Verify on backend
            const verification = await adminAuthApi.verifyRegistration(registrationEmail, regResp);

            if (verification.verified) {
                toast.success('Passkey registered successfully!');
                setIsRegistering(false);

                // Auto-login after successful registration
                await new Promise(resolve => setTimeout(resolve, 1000));

                console.log('[Registration] Auto-login starting...');
                const loginOptions = await adminAuthApi.getLoginOptions(registrationEmail);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const loginAsseResp = await startAuthentication({ optionsJSON: loginOptions as any });
                const loginVerification = await adminAuthApi.verifyLogin(registrationEmail, loginAsseResp);

                if (loginVerification.verified) {
                    toast.success('Logged in successfully!');
                    setTimeout(() => {
                        window.location.href = '/admin/dashboard';
                    }, 500);
                } else {
                    toast.error('Auto-login failed. Please login manually.');
                    setIsLoading(false);
                }
            } else {
                throw new Error('Registration verification failed');
            }
        } catch (err: unknown) {
            console.error('[Registration Error]', err);
            const message = err instanceof Error ? err.message : 'Registration failed.';
            toast.error(message);
            setIsLoading(false);
            setIsRegistering(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 bg-card/10 backdrop-blur-xl border border-border/50 p-8 rounded-2xl shadow-2xl">
                <div className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                        <ShieldCheckIcon className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-black italic tracking-tight uppercase text-foreground">Admin Access</h1>
                    <p className="text-sm text-muted-foreground/80">Passkey-only hardware authentication</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Admin Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="admin@fresherflow.in"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/30"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <FingerPrintIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    {isRegistering ? 'Registering...' : 'Authenticate'}
                                </>
                            )}
                        </span>
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/30"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card/10 px-2 text-muted-foreground/60 font-bold tracking-wider">OR</span>
                    </div>
                </div>

                <button
                    onClick={handleQuickLogin}
                    disabled={isLoading}
                    className="w-full h-12 bg-primary/5 hover:bg-primary/10 border-2 border-primary/20 hover:border-primary/40 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <ShieldCheckIcon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-primary">Quick Login as Admin</span>
                </button>

                <div className="pt-6 border-t border-border/50 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold opacity-60">
                        Securely stored on your device hardware (Touch ID / Face ID / USB)
                    </p>
                </div>
            </div>
        </div>
    );
}
