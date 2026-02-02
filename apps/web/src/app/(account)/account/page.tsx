'use client';

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AccountPage() {
    const { user, profile, isLoading, logout } = useAuth();
    const loading = isLoading;

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" /></div>;

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
                <div className="text-center space-y-6">
                    <h1 className="tracking-tighter">Please sign in</h1>
                    <p className="text-slate-500 font-medium tracking-tight">You need to be signed in to view your profile.</p>
                    <Link href="/login" className="premium-button bg-slate-900 text-white mx-auto">Go to Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 animate-in fade-in duration-700 pb-[64px] md:pb-0">
            <main className="max-content py-10 space-y-12">
                <h1 className="tracking-tighter">My Account</h1>

                <div className="job-card !gap-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Identifier</p>
                            <h2 className="tracking-tight">{user.email}</h2>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black shadow-xl shadow-slate-200">
                            {user.email?.[0].toUpperCase()}
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Protocol</p>
                        <p className="font-bold text-slate-900">
                            Verified User Session
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link
                        href="/account/saved"
                        className="job-card group hover:border-slate-300 transition-all"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="tracking-tight">Saved Stream</h3>
                            <p className="text-slate-500 font-medium text-sm">View jobs you've prioritized</p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard"
                        className="job-card group hover:border-slate-300 transition-all"
                    >
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="tracking-tight">Control Hub</h3>
                            <p className="text-slate-500 font-medium text-sm">Manage your session & activity</p>
                        </div>
                    </Link>
                </div>

                <button
                    onClick={logout}
                    className="w-full h-[56px] text-rose-600 font-black border-2 border-rose-100 rounded-2xl hover:bg-rose-50 hover:border-rose-200 transition-all uppercase tracking-widest text-[11px]"
                >
                    Terminate Session
                </button>
            </main>
        </div>
    );
}
