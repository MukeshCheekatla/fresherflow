'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import { cn } from '@/lib/utils';
import {
    BriefcaseIcon,
    MapPinIcon,
    PlusCircleIcon,
    ArrowRightIcon,
    ChartBarIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminDashboardHome() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recent, setRecent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        jobs: 0,
        walkins: 0,
        total: 0,
        recent24h: 0
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [summaryRes, recentRes] = await Promise.all([
                    adminApi.getOpportunitiesSummary(),
                    adminApi.getOpportunities({ limit: 5 })
                ]);

                const summary = summaryRes.summary || {};
                const opportunities = recentRes.opportunities || [];

                setRecent(opportunities);
                setStats({
                    jobs: (summary.total || 0) - (summary.walkins || 0),
                    walkins: summary.walkins || 0,
                    total: summary.total || 0,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    recent24h: opportunities.filter((o: any) => {
                        const posted = new Date(o.postedAt).getTime();
                        return posted > Date.now() - 24 * 60 * 60 * 1000;
                    }).length
                });
            } catch (err: unknown) {
                const error = err as Error;
                toast.error(`Failed to load dashboard: ${error.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const statsCards = [
        { label: 'Live Online Jobs', value: stats.jobs, icon: BriefcaseIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Walk-in Drives', value: stats.walkins, icon: MapPinIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Total Postings', value: stats.total, icon: ChartBarIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Recent (24h)', value: stats.recent24h, icon: ClockIcon, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-700 pb-8 text-foreground">
            <header className="space-y-0.5">
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Command Center</h1>
                <p className="text-xs md:text-sm text-muted-foreground">Platform overview and management hub.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {statsCards.map((stat) => (
                    <div key={stat.label} className="bg-card p-4 md:p-5 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-muted-foreground tracking-wide truncate pr-2">
                                {stat.label}
                            </span>
                            <stat.icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4 shrink-0", stat.color)} />
                        </div>
                        <p className="text-xl font-semibold tracking-tight">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <Link
                    href="/admin/opportunities/create"
                    className="group bg-card p-4 md:p-5 rounded-lg border border-border shadow-sm flex items-center justify-between transition-all hover:border-primary/50 hover:shadow-md"
                >
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-primary">
                            <PlusCircleIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">Global Stream</span>
                        </div>
                        <h3 className="text-sm md:text-base font-semibold">Post New Listing</h3>
                        <p className="text-[11px] md:text-xs text-muted-foreground font-medium">Add jobs, internships or walk-ins.</p>
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-primary/10 rounded-md flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <ArrowRightIcon className="w-4 h-4 text-primary" />
                    </div>
                </Link>

                <Link
                    href="/admin/feedback"
                    className="group bg-card p-4 md:p-5 rounded-lg border border-border shadow-sm flex items-center justify-between transition-all hover:border-primary/50 hover:shadow-md"
                >
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-emerald-500">
                            <ChartBarIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">Platform Pulse</span>
                        </div>
                        <h3 className="text-sm md:text-base font-semibold">Review Feedback</h3>
                        <p className="text-[11px] md:text-xs text-muted-foreground font-medium">Analyze user reports and logs.</p>
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-muted rounded-md flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                        <ArrowRightIcon className="w-4 h-4 text-foreground/70" />
                    </div>
                </Link>
            </div>

            {/* Recent Postings Simple List */}
            <div className="bg-card dark:bg-card/40 rounded-lg border border-border shadow-sm overflow-hidden w-full">
                <div className="px-4 py-3 md:px-5 md:py-4 border-b border-border flex justify-between items-center bg-muted/20 md:bg-transparent">
                    <h3 className="text-sm md:text-base font-semibold tracking-tight">Recent Activity Stream</h3>
                    <Link href="/admin/opportunities" className="text-[10px] md:text-xs font-medium text-primary hover:underline">View Full Log</Link>
                </div>
                <div className="divide-y divide-border">
                    {recent.map((item) => {
                        const isWalkin = item.type === 'WALKIN';
                        return (
                            <div key={item.id} className="px-4 py-2.5 md:px-5 md:py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                <div className="min-w-0 flex-1 pr-2">
                                    <p className="text-xs md:text-sm font-medium truncate">
                                        {item.company}
                                    </p>
                                    <p className="text-[10px] md:text-xs text-muted-foreground truncate font-medium">
                                        {item.title || item.normalizedRole}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 text-right space-y-0.5 md:space-y-1">
                                    <span className="text-[9px] md:text-xs text-muted-foreground font-medium block">
                                        {new Date(item.postedAt).toLocaleDateString()}
                                    </span>
                                    <span className={cn(
                                        "inline-flex items-center rounded-md px-1 py-0.5 md:px-1.5 md:py-0.5 text-[9px] md:text-xs font-medium ring-1 ring-inset",
                                        isWalkin ? "bg-amber-500/10 text-amber-500 ring-amber-500/20" : "bg-blue-500/10 text-blue-500 ring-blue-500/20"
                                    )}>
                                        {item.type}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {recent.length === 0 && (
                        <div className="px-5 py-6 text-center text-xs md:text-sm text-muted-foreground">
                            No recent activity found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

