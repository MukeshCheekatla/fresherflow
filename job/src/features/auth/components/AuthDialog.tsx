'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/shared/utils/cn';
import { useRouter } from 'next/navigation';

interface AuthDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
    const { loginWithGoogle, loginWithEmail } = useAuth();
    const [email, setEmail] = useState('');
    const [method, setMethod] = useState<'options' | 'email'>('options');
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const router = useRouter();

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const result = await loginWithGoogle();
            const user = result.user;
            const adminUids = process.env.NEXT_PUBLIC_ADMIN_UIDS?.split(',') || [];

            if (adminUids.includes(user.uid)) {
                router.push('/admin');
            } else {
                router.push('/walkins');
            }
            onClose();
        } catch (error) {
            console.error('Google login failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // ... for email logic too ...

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await loginWithEmail(email);
            setEmailSent(true);
        } catch (error) {
            console.error('Email login failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                            {emailSent ? 'Check your email' : 'Welcome to JobDiscover'}
                        </h2>
                        <p className="text-neutral-600">
                            {emailSent
                                ? `We've sent a magic link to ${email}`
                                : 'Sign in to save jobs and set alerts'}
                        </p>
                    </div>

                    {emailSent ? (
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                        >
                            Close
                        </button>
                    ) : (
                        <div className="space-y-4">
                            {method === 'options' ? (
                                <>
                                    <button
                                        onClick={handleGoogleLogin}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-3 py-3 border border-neutral-200 rounded-lg font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Continue with Google
                                    </button>

                                    <button
                                        onClick={() => setMethod('email')}
                                        className="w-full py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                                    >
                                        Continue with Email
                                    </button>

                                    <button
                                        onClick={onClose}
                                        className="w-full py-2 text-sm text-neutral-500 hover:text-neutral-900 font-medium transition-colors"
                                    >
                                        Continue as Guest
                                    </button>
                                </>
                            ) : (
                                <form onSubmit={handleEmailSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-900 mb-2">
                                            Email address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || !email}
                                        className="w-full py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Sending link...' : 'Send Magic Link'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMethod('options')}
                                        className="w-full py-2 text-sm text-neutral-500 hover:text-neutral-900 font-medium transition-colors"
                                    >
                                        Back to options
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
