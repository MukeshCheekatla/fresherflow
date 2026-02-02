'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { opportunitiesApi } from '@/lib/api/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Opportunity } from '@/types/api';
import toast from 'react-hot-toast';
import {
    Search,
    MapPin,
    Briefcase,
    Clock,
    IndianRupee,
    Sparkles,
    Filter,
    ChevronRight,
    LayoutDashboard,
    LogOut,
    ArrowLeft,
    Calendar,
    Building2,
    AlertCircle
} from 'lucide-react';

export default function OpportunitiesPage() {
    const { user, logout } = useAuth();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: '',
        city: '',
        closingSoon: false
    });

    useEffect(() => {
        loadOpportunities();
    }, [filters]);

    const loadOpportunities = async () => {
        setIsLoading(true);
        try {
            const response = await opportunitiesApi.list(filters.type || filters.city || filters.closingSoon ? filters : undefined);
            setOpportunities(response.opportunities || []);
        } catch (error: any) {
            toast.error(`❌ Load failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        const loading = toast.loading('🔒 Securing session...');
        try {
            await logout();
            toast.success('Goodbye!', { id: loading });
            window.location.href = '/login';
        } catch (err) {
            toast.error('Logout error', { id: loading });
        }
    };

    return (
        <AuthGate>
            <ProfileGate>
                <div className="min-h-screen bg-slate-50 animate-in fade-in duration-700">
                    {/* Sticky Nav */}
                    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                            <Link href="/dashboard" className="flex items-center gap-2 group">
                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-black text-2xl tracking-tighter text-slate-900">FresherFlow</span>
                            </Link>
                            <div className="hidden md:flex items-center gap-8">
                                <Link href="/opportunities" className="text-sm font-black text-slate-900 border-b-2 border-slate-900 pb-1">One Stream</Link>
                                <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Dashboard</Link>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:block text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Logged as</p>
                                    <p className="text-xs font-bold text-slate-900">{user?.fullName?.split(' ')[0]}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </nav>

                    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
                        {/* Hero & Search */}
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Live Stream</h2>
                                    <p className="text-slate-500 font-medium">Curated opportunities matched to your engineering profile.</p>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live Updates Only</span>
                                </div>
                            </div>

                            {/* Filter Hub */}
                            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
                                <div className="flex-1 w-full relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={filters.city}
                                        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                        className="premium-input pl-11 py-3 bg-slate-50/50 border-transparent focus:bg-white"
                                        placeholder="City, Region or Remote"
                                    />
                                </div>
                                <div className="w-full md:w-48">
                                    <select
                                        value={filters.type}
                                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                        className="premium-input py-3 bg-slate-50/50 border-transparent focus:bg-white cursor-pointer"
                                    >
                                        <option value="">All Streams</option>
                                        <option value="JOB">Direct Job</option>
                                        <option value="INTERNSHIP">Internship</option>
                                        <option value="WALKIN">Walking Drive</option>
                                    </select>
                                </div>
                                <label className="flex items-center gap-3 px-6 py-3 bg-slate-50/50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={filters.closingSoon}
                                        onChange={(e) => setFilters({ ...filters, closingSoon: e.target.checked })}
                                        className="w-5 h-5 rounded-lg border-slate-300 text-slate-900 focus:ring-slate-900"
                                    />
                                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Closing Soon</span>
                                </label>
                            </div>
                            <div className="flex items-center justify-between px-2">
                                <p className="text-sm font-black text-slate-900 tracking-tight">
                                    {opportunities.length} {opportunities.length === 1 ? 'Opportunity' : 'Opportunities'} in the Flow
                                </p>
                            </div>
                        </div>

                        {/* List */}
                        {isLoading ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => <div key={i} className="h-44 bg-white border border-slate-100 rounded-[2.5rem] animate-pulse" />)}
                            </div>
                        ) : opportunities.length === 0 ? (
                            <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                    <AlertCircle className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Zero Matches Found</h3>
                                <p className="text-slate-500 font-medium max-w-xs mx-auto">Try loosening your filters or expanding your location targets.</p>
                                <button
                                    onClick={() => setFilters({ type: '', city: '', closingSoon: false })}
                                    className="text-slate-900 font-black text-xs uppercase tracking-widest hover:underline"
                                >
                                    Reset Core Filters
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {opportunities.map((opp) => (
                                    <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-slate-300 transition-all group cursor-pointer relative overflow-hidden">
                                            <div className="relative z-10">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                                                    <div className="space-y-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${opp.type === 'WALKIN' ? 'bg-orange-100 text-orange-600' :
                                                                opp.type === 'INTERNSHIP' ? 'bg-purple-100 text-purple-600' :
                                                                    'bg-blue-100 text-blue-600'
                                                                }`}>
                                                                {opp.type}
                                                            </span>
                                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                <Clock className="w-3 h-3" />
                                                                {opp.workMode || 'ONSITE'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors">
                                                                {opp.title}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Building2 className="w-4 h-4 text-slate-300" />
                                                                <p className="text-slate-500 font-bold text-sm">{opp.company}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {opp.salaryMin && (
                                                        <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 text-right">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Comp</p>
                                                            <p className="text-xl font-black text-emerald-600 tracking-tighter">
                                                                ₹{(opp.salaryMin / 100000).toFixed(1)}-{(opp.salaryMax || 0 / 100000).toFixed(1)} LPA
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 mb-6">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-slate-300" />
                                                        <span>{opp.locations.join(', ')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="w-4 h-4 text-slate-300" />
                                                        <span>{opp.requiredSkills.slice(0, 3).join(' • ')}</span>
                                                    </div>
                                                    {opp.expiresAt && (
                                                        <div className="flex items-center gap-2 text-rose-500">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>Ending {new Date(opp.expiresAt).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Verified Flow Entry</span>
                                                    <div className="flex items-center gap-1 text-blue-600 font-black text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
                                                        View Listing Details
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hover Decor */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rotate-45 translate-x-16 -translate-y-16 group-hover:bg-slate-100 transition-colors pointer-events-none" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </ProfileGate>
        </AuthGate>
    );
}
