'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
    BookmarkIcon,
    Squares2X2Icon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    ShieldCheckIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function AccountPage() {
    const { user, isLoading, logout } = useAuth();

    if (isLoading) return <LoadingScreen message="Loading..." />;

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-6">
                <div className="text-center space-y-6 animate-in fade-in duration-700">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <UserCircleIcon className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Sign in required</h1>
                        <p className="text-muted-foreground font-medium">Please sign in to manage your account.</p>
                    </div>
                    <Link href="/login" className="premium-button mx-auto !w-fit px-8">Sign in</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background animate-in fade-in duration-700 pb-16">
            <main className="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="p-2 hover:bg-muted rounded-xl transition-colors">
                        <ArrowLeftIcon className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tighter">Account</h1>
                </div>

                {/* Identity Card */}
                <div className="premium-card p-5! md:p-8! flex flex-col md:flex-row items-center gap-5 md:gap-6 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-xl md:text-2xl font-bold shadow-lg shadow-primary/20 shrink-0">
                            {user.fullName?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Signed-in profile</p>
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight">{user.fullName || 'User'}</h2>
                            <p className="text-muted-foreground font-medium text-xs md:text-sm">{user.email}</p>
                        </div>
                    </div>
                    <div className="w-full md:w-auto px-4 py-3 bg-success/5 border border-success/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheckIcon className="w-4 h-4 text-success" />
                            <span className="text-[10px] font-bold text-success uppercase tracking-widest">Status</span>
                        </div>
                        <p className="text-xs font-bold text-foreground">Active session</p>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <Link
                        href="/account/saved"
                        className="flex items-center gap-4 px-4 py-4 hover:bg-muted/40 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                            <BookmarkIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold tracking-tight">Saved</h3>
                            <p className="text-[11px] text-muted-foreground">Your bookmarked opportunities</p>
                        </div>
                        <span className="text-xs text-muted-foreground">View</span>
                    </Link>
                    <div className="h-px bg-border" />
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-4 px-4 py-4 hover:bg-muted/40 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                            <Squares2X2Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold tracking-tight">Dashboard</h3>
                            <p className="text-[11px] text-muted-foreground">Your activity and highlights</p>
                        </div>
                        <span className="text-xs text-muted-foreground">Open</span>
                    </Link>
                </div>

                {/* Danger Zone */}
                <div className="pt-4 space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 leading-none">Account actions</p>
                    <button
                        onClick={logout}
                        className="w-full h-12 flex items-center justify-center gap-3 text-error font-bold border border-error/20 bg-error/5 rounded-2xl hover:bg-error/10 transition-all text-xs uppercase tracking-widest shadow-sm"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        Sign out
                    </button>
                    <p className="text-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tight">Build: FF-GENA-2026-X1</p>
                </div>
            </main>
        </div>
    );
}

