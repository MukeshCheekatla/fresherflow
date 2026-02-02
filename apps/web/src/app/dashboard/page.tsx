'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { actionsApi } from '@/lib/api/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
    Briefcase,
    MapPin,
    User,
    LogOut,
    Sparkles,
    FileText,
    Calendar,
    Layers,
    Search,
    Settings,
    ArrowRight,
    TrendingUp,
    LayoutDashboard
} from 'lucide-react';

export default function DashboardPage() {
    const { user, profile, logout } = useAuth();
    const router = useRouter();
    const [actionsSummary, setActionsSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const summary = await actionsApi.summary();
            setActionsSummary(summary);
        } catch (error: any) {
            toast.error(`❌ Session sync failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        const loadingToast = toast.loading('🔒 Securely logging out...');
        try {
            await logout();
            toast.success('👋 Session ended. See you soon!', { id: loadingToast });
            router.push('/login');
        } catch (err) {
            toast.error('Logout failed', { id: loadingToast });
        }
    };

    return (
        <AuthGate>
            <ProfileGate>
                <div className="min-h-screen bg-slate-50 animate-in fade-in duration-700 pb-20">
                    {/* Navigation */}
                    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                            <Link href="/dashboard" className="flex items-center gap-2 group">
                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-black text-2xl tracking-tighter text-slate-900">FresherFlow</span>
                            </Link>
                            <div className="hidden md:flex items-center gap-8">
                                <Link href="/opportunities" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">One Stream</Link>
                                <Link href="/dashboard" className="text-sm font-black text-slate-900 border-b-2 border-slate-900 pb-1">Dashboard</Link>
                                <Link href="/profile/edit" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Profile</Link>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                                <div className="w-10 h-10 bg-slate-100 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-600">
                                    {user?.fullName?.[0]}
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Main */}
                    <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">

                        {/* Welcome Hero */}
                        <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl shadow-slate-200">
                            <div className="relative z-10 max-w-2xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full backdrop-blur-md text-xs font-black tracking-widest uppercase border border-white/5">
                                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                                    Active Career Pulse
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                                    Welcome home, {user?.fullName?.split(' ')[0]}.
                                </h2>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                    Your personal hub for tracking matches, analyzing readiness, and securing your future.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <Link href="/opportunities" className="premium-button bg-white text-slate-900 hover:bg-slate-100 py-4 px-8 flex items-center gap-2">
                                        <Search className="w-5 h-5" />
                                        Explore Matches
                                    </Link>
                                    <Link href="/profile/edit" className="premium-button-outline border-white/20 text-white hover:bg-white/5 py-4 px-8">
                                        Update Readiness
                                    </Link>
                                </div>
                            </div>
                            {/* Abstract Decor */}
                            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
                            <div className="absolute bottom-[-50%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
                        </div>

                        {/* Status Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Profile Depth', value: `${profile?.completionPercentage}%`, icon: User, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                { label: 'Applied', value: actionsSummary?.APPLIED || 0, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
                                { label: 'Planning', value: actionsSummary?.PLANNING || 0, icon: Layers, color: 'text-purple-500', bg: 'bg-purple-50' },
                                { label: 'Attended', value: actionsSummary?.ATTENDED || 0, icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-3xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                            <stat.icon className="w-7 h-7" />
                                        </div>
                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest pt-1">Live Sync</div>
                                    </div>
                                    <h4 className="text-3xl font-black text-slate-900 mb-1">{isLoading ? '...' : stat.value}</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Secondary Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                            <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden group hover:shadow-2xl transition-all h-[320px] flex flex-col">
                                <div className="p-10 flex-1 space-y-4">
                                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                        <Briefcase className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">One Stream Vault</h3>
                                    <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                        Hand-picked career paths verified by our engine and aligned with your profile skills.
                                    </p>
                                </div>
                                <Link href="/opportunities" className="bg-slate-50 p-6 flex items-center justify-between group-hover:bg-slate-100 transition-colors">
                                    <span className="font-bold text-slate-900">Access Vault</span>
                                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden group hover:shadow-2xl transition-all h-[320px] flex flex-col">
                                <div className="p-10 flex-1 space-y-4">
                                    <div className="w-14 h-14 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center">
                                        <Settings className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Profile Engineering</h3>
                                    <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                        Retune your preferences, location targets, and skill catalog to improve match accuracy.
                                    </p>
                                </div>
                                <Link href="/profile/edit" className="bg-slate-50 p-6 flex items-center justify-between group-hover:bg-slate-100 transition-colors">
                                    <span className="font-bold text-slate-900">Optimization Hub</span>
                                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </main>
                </div>
            </ProfileGate>
        </AuthGate>
    );
}
