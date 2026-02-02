'use client';

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
    BookmarkIcon,
    Squares2X2Icon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    ShieldCheckIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function AccountPage() {
    const { user, profile, isLoading, logout } = useAuth();

    if (isLoading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-6">
                <div className="text-center space-y-6 animate-in fade-in duration-700">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <UserCircleIcon className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight">Access Restricted</h1>
                        <p className="text-muted-foreground font-medium">Please sign in to manage your professional account.</p>
                    </div>
                    <Link href="/login" className="premium-button mx-auto !w-fit px-8">Sign In Now</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background animate-in fade-in duration-700 pb-20">
            <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-muted rounded-xl transition-colors">
                        <ArrowLeftIcon className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic">Account Hub</h1>
                </div>

                {/* Identity Card */}
                <div className="premium-card !p-8 md:!p-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-primary/20 shrink-0">
                            {user.fullName?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Authenticated Identity</p>
                            <h2 className="text-2xl font-black tracking-tight">{user.fullName || 'User'}</h2>
                            <p className="text-muted-foreground font-medium text-sm">{user.email}</p>
                        </div>
                    </div>
                    <div className="w-full md:w-auto px-6 py-4 bg-success/5 border border-success/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheckIcon className="w-4 h-4 text-success" />
                            <span className="text-[10px] font-black text-success uppercase tracking-widest">Protocol</span>
                        </div>
                        <p className="text-xs font-bold text-foreground">Active Verified Session</p>
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href="/account/saved"
                        className="premium-card !p-6 group hover:border-primary/50 transition-all flex items-center gap-5"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                            <BookmarkIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">Saved Stream</h3>
                            <p className="text-muted-foreground font-medium text-xs">Priority items in your queue</p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard"
                        className="premium-card !p-6 group hover:border-primary/50 transition-all flex items-center gap-5"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                            <Squares2X2Icon className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">Career Hub</h3>
                            <p className="text-muted-foreground font-medium text-xs">Manage matches and metrics</p>
                        </div>
                    </Link>
                </div>

                {/* Danger Zone */}
                <div className="pt-8 space-y-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 leading-none">Settings Zone</p>
                    <button
                        onClick={logout}
                        className="w-full h-14 flex items-center justify-center gap-3 text-error font-black border border-error/20 bg-error/5 rounded-2xl hover:bg-error/10 transition-all text-xs uppercase tracking-widest shadow-sm"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        Terminate Active Session
                    </button>
                    <p className="text-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tight">System Vers: FF-GENA-2026-X1</p>
                </div>
            </main>
        </div>
    );
}
