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
    const [email, setEmailState] = useState(() => (typeof window !== 'undefined' ? sessionStorage.getItem('adminSetupEmail') || '' : ''));
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const setEmail = (val: string) => {
        if (typeof window !== 'undefined') sessionStorage.setItem('adminSetupEmail', val);
        setEmailState(val);
    };

    // PERSIST setup state across context re-renders
    const [isFirstTimeSetup, setIsFirstTimeSetupState] = useState(
        () => sessionStorage.getItem('adminSetupMode') === 'true'
    );

    const setIsFirstTimeSetup = (value: boolean) => {
        console.log('[DEBUG] Setting isFirstTimeSetup to:', value);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('adminSetupMode', value.toString());
            if (value) sessionStorage.setItem('adminSetupEmail', email);
            else sessionStorage.removeItem('adminSetupEmail');
        }
        setIsFirstTimeSetupState(value);
    };

    // Use Context
    const { login, setupPassword, isLoading } = useAdmin();

    // DEBUG: Track state changes
    console.log('[RENDER] isFirstTimeSetup:', isFirstTimeSetup);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        const loadingToast = toast.loading(isFirstTimeSetup ? '⚡ Setting up admin account...' : '🔒 Verifying credentials...');

        try {
            if (isFirstTimeSetup) {
                if (password !== confirmPassword) {
                    toast.error('Passwords do not match', { id: loadingToast });
                    return;
                }
                console.log('[DEBUG] Calling setupPassword with:', email);
                await setupPassword(email, password);
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('adminSetupMode');
                    sessionStorage.removeItem('adminSetupEmail');
                }
                toast.success('🚀 Setup complete! Welcome, Admin.', { id: loadingToast });
            } else {
                const response = await login(email, password);
                console.log('[DEBUG] Login response:', response);
                if (response.setupRequired) {
                    console.log('[DEBUG] BEFORE - isFirstTimeSetup:', isFirstTimeSetup);
                    setIsFirstTimeSetup(true);
                    console.log('[DEBUG] setState(true) called');
                    setPassword(''); // CLEAR password so they can enter the new one
                    toast.success('🎯 Identity verified. Please set your secure password.', { id: loadingToast });
                } else {
                    toast.success('✅ Welcome back, Admin.', { id: loadingToast });
                }
            }
            // Redirect handled by Context (router.push)
        } catch (err) {
            console.error('[DEBUG] Error in handleSubmit:', err);
            const error = err as Error;
            toast.error(error.message || 'Action failed', { id: loadingToast });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 animate-in fade-in duration-700">
            <div className="max-w-[440px] w-full">
                {/* Brand */}
                <div className="text-center mb-10 space-y-4">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3 transform hover:rotate-0 transition-all duration-500 ${isFirstTimeSetup ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-primary shadow-primary/20'}`}>
                        <LockClosedIcon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="tracking-tighter text-2xl font-bold text-foreground">
                        {isFirstTimeSetup ? 'Initialize Admin' : 'Admin Portal'}
                    </h1>
                    <p className="text-muted-foreground font-medium tracking-tight">
                        {isFirstTimeSetup ? '🚨 Action Required: Set your permanent admin password' : 'Executive Management Interface'}
                    </p>
                </div>

                {/* Card */}
                <div className={`rounded-[2.5rem] p-10 border shadow-2xl shadow-black/5 transition-all duration-500 ${isFirstTimeSetup ? 'bg-emerald-950/20 border-emerald-600' : 'bg-card border-border'}`}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Email Identity
                            </label>
                            <input
                                type="email"
                                required
                                readOnly={isFirstTimeSetup && email.length > 0}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`premium-input bg-background w-full p-3 border rounded-xl ${isFirstTimeSetup && email.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                placeholder="admin@fresherflow.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                                {isFirstTimeSetup ? 'Set New Password' : 'Secure Key'}
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

                        {isFirstTimeSetup && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="premium-input bg-background w-full p-3 border rounded-xl"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full premium-button h-[56px] flex items-center justify-center gap-2 ${isFirstTimeSetup ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary/90'} text-primary-foreground rounded-xl transition-colors`}
                        >
                            {isLoading ? (
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            ) : (
                                <ShieldCheckIcon className="w-5 h-5" />
                            )}
                            {isLoading ? (isFirstTimeSetup ? 'Initializing...' : 'Decrypting...') : (isFirstTimeSetup ? 'Set Password & Authorize' : 'Authorize Login')}
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
