'use client';

import { useAuth } from '@/context/AuthContext';
import TopNav from '@/shared/components/navigation/TopNav';
import { cn } from '@/shared/utils/cn';
import Link from 'next/link';

export default function AccountPage() {
    const { user, profile, loading, logout } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <TopNav />
                <main className="max-w-3xl mx-auto px-4 py-8 text-center text-neutral-600">
                    Loading profile...
                </main>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <TopNav />
                <main className="max-w-3xl mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
                    <p className="text-neutral-600 mb-6">You need to be signed in to view your profile.</p>
                    <Link href="/" className="text-primary hover:underline">Go back to home</Link>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <TopNav />
            <main className="max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-neutral-900 mb-8">My Account</h1>

                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden mb-6">
                    <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider mb-1">Email Address</p>
                            <p className="text-lg font-medium text-neutral-900">{user.email}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                            {user.email?.[0].toUpperCase()}
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider mb-1">Member Since</p>
                        <p className="text-neutral-900">
                            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Loading...'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Link
                        href="/account/saved"
                        className="p-6 bg-white rounded-2xl border border-neutral-200 hover:border-primary/50 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900">Saved Jobs</h3>
                        <p className="text-neutral-600 text-sm">View jobs you've bookmarked</p>
                    </Link>

                    <Link
                        href="/alerts"
                        className="p-6 bg-white rounded-2xl border border-neutral-200 hover:border-primary/50 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900">Job Alerts</h3>
                        <p className="text-neutral-600 text-sm">Manage your notifications</p>
                    </Link>
                </div>

                <button
                    onClick={logout}
                    className="w-full py-4 text-red-600 font-medium border border-red-200 rounded-2xl hover:bg-red-50 transition-colors"
                >
                    Sign Out
                </button>
            </main>
        </div>
    );
}
