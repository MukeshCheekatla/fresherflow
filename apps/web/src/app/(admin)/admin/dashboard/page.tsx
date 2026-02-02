'use client';

import { useAdmin } from '@/contexts/AdminContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
    BriefcaseIcon,
    ClockIcon,
    GlobeAltIcon,
    TrashIcon,
    ChevronRightIcon,
    ArrowUpRightIcon,
    PlusIcon,
    ChartBarIcon,
    CalendarIcon,
    ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboardPage() {
    const { isAuthenticated, logout, token } = useAdmin();
    const router = useRouter();

    // Stats state
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        walkins: 0,
        expired: 0,
        loading: true
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
            return;
        }
        fetchStats();
    }, [isAuthenticated, router]);

    const fetchStats = async () => {
        if (!token) return;

        try {
            const response = await fetch('http://localhost:5000/api/admin/opportunities', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 403 || response.status === 401) {
                toast.error('🔒 Session expired. Please login again.');
                logout();
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const opportunities = data.opportunities || [];

            setStats({
                total: opportunities.length,
                active: opportunities.filter((o: any) => o.status === 'ACTIVE').length,
                walkins: opportunities.filter((o: any) => o.type === 'WALKIN').length,
                expired: opportunities.filter((o: any) => o.status === 'EXPIRED').length,
                loading: false
            });
        } catch (error: any) {
            console.error('Error fetching stats:', error);
            toast.error(`❌ Failed to load stats: ${error.message}`);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    if (!isAuthenticated) return null;

    const cards = [
        { label: 'Total Listings', value: stats.total, icon: ChartBarIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Jobs', value: stats.active, icon: BriefcaseIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Walk-ins', value: stats.walkins, icon: CalendarIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Expired', value: stats.expired, icon: ClockIcon, color: 'text-slate-600', bg: 'bg-slate-100' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
                    <p className="text-slate-500 font-medium">Platform performance and listing status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchStats()}
                        className="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <ClockIcon className="w-5 h-5" />
                    </button>
                    <Link href="/admin/opportunities/create" className="premium-button flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" />
                        New Opportunity
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-3xl font-black text-slate-900">
                                    {stats.loading ? (
                                        <div className="h-8 w-12 bg-slate-100 animate-pulse rounded" />
                                    ) : card.value}
                                </h2>
                                <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
                                    <ArrowUpRightIcon className="w-3 h-3" />
                                    Live
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Shortcuts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-900">Quick Actions</h3>
                        <Link href="/admin/opportunities" className="text-sm font-semibold text-blue-600 hover:underline">View All</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'New Job Listing', desc: 'Create a permanent role', icon: GlobeAltIcon, href: '/admin/opportunities/create' },
                            { title: 'New Internship', desc: 'Post a student opportunity', icon: ChartBarIcon, href: '/admin/opportunities/create' },
                            { title: 'Review Feedback', desc: 'Check user reports', icon: ChatBubbleBottomCenterTextIcon, href: '/admin/feedback' },
                            { title: 'Manage Listings', desc: 'Update or remove jobs', icon: BriefcaseIcon, href: '/admin/opportunities' },
                        ].map((action, i) => (
                            <Link
                                key={i}
                                href={action.href}
                                className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group"
                            >
                                <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-white transition-colors">
                                    <action.icon className="w-6 h-6 text-slate-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600">{action.title}</h4>
                                    <p className="text-sm text-slate-500">{action.desc}</p>
                                </div>
                                <ChevronRightIcon className="w-5 h-5 text-slate-300 group-hover:text-slate-900" />
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col h-full">
                        <h3 className="text-2xl font-bold mb-4">Premium Insights</h3>
                        <p className="text-slate-400 mb-8 flex-1">
                            Get real-time data on how your posted opportunities are performing. See applicant traffic and match rates.
                        </p>
                        <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                            View Analytics
                            <ArrowUpRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Decorative Background Elements */}
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-700" />
                    <div className="absolute top-12 left-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-700" />
                </div>
            </div>
        </div>
    );
}

