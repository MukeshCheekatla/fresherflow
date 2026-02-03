'use client';

import { useAdmin } from '@/contexts/AdminContext';
import { adminApi } from '@/lib/api/admin';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
    BriefcaseIcon,
    ClockIcon,
    GlobeAltIcon,
    ChevronRightIcon,
    ArrowUpRightIcon,
    PlusIcon,
    ChartBarIcon,
    CalendarIcon,
    ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboardPage() {
    const { isAuthenticated, logout } = useAdmin();
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
        if (!isAuthenticated) return;

        try {
            const data = await adminApi.getOpportunitiesSummary();
            const summary = data.summary || {};

            setStats({
                total: summary.total || 0,
                active: summary.active || 0,
                walkins: summary.walkins || 0,
                expired: summary.expired || 0,
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
        { label: 'Total Listings', value: stats.total, icon: ChartBarIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Active Jobs', value: stats.active, icon: BriefcaseIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Walk-ins', value: stats.walkins, icon: CalendarIcon, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Expired', value: stats.expired, icon: ClockIcon, color: 'text-muted-foreground', bg: 'bg-muted' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Overview</h1>
                    <p className="text-sm text-muted-foreground">Platform performance and listing status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchStats()}
                        className="p-2.5 text-muted-foreground bg-card border border-border rounded-xl hover:bg-muted/50 transition-all active:scale-95"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.12em]">{card.label}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-3xl font-bold text-foreground">
                                    {stats.loading ? (
                                        <div className="h-8 w-12 bg-muted animate-pulse rounded" />
                                    ) : card.value}
                                </h2>
                                <div className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
                                    <ArrowUpRightIcon className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Shortcuts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 bg-card rounded-3xl border border-border p-5 md:p-7">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
                        <Link href="/admin/opportunities" className="text-sm font-semibold text-blue-500 hover:underline">View All</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: 'New Job Listing', desc: 'Create a permanent role', icon: GlobeAltIcon, href: '/admin/opportunities/create' },
                            { title: 'New Internship', desc: 'Post a student opportunity', icon: ChartBarIcon, href: '/admin/opportunities/create' },
                            { title: 'Review Feedback', desc: 'Check user reports', icon: ChatBubbleBottomCenterTextIcon, href: '/admin/feedback' },
                            { title: 'Manage Listings', desc: 'Update or remove jobs', icon: BriefcaseIcon, href: '/admin/opportunities' },
                        ].map((action, i) => (
                            <Link
                                key={i}
                                href={action.href}
                                className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card/50 hover:border-primary/50 hover:bg-muted/30 transition-all group"
                            >
                                <div className="p-3 bg-muted rounded-xl group-hover:bg-background transition-colors">
                                    <action.icon className="w-6 h-6 text-muted-foreground group-hover:text-foreground" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-base font-bold text-foreground group-hover:text-blue-500">{action.title}</h4>
                                    <p className="text-sm text-muted-foreground">{action.desc}</p>
                                </div>
                                <ChevronRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
