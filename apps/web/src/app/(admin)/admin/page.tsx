'use client';

import { useJobs } from '@/features/jobs/hooks/useJobs';
import { useWalkins } from '@/features/walkins/hooks/useWalkins';
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

export default function AdminDashboardHome() {
    const { jobs, loading: jobsLoading } = useJobs();
    const { walkins, loading: walkinsLoading } = useWalkins();

    const liveJobsCount = jobs.length;
    const walkinsCount = walkins.length;

    const stats = [
        { label: 'Live Online Jobs', value: liveJobsCount, icon: BriefcaseIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Walk-in Drives', value: walkinsCount, icon: MapPinIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Total Postings', value: liveJobsCount + walkinsCount, icon: ChartBarIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Recent (24h)', value: 0, icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    if (jobsLoading || walkinsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="space-y-1">
                <h1 className="tracking-tighter text-slate-100">Command Center</h1>
                <p className="text-slate-400 font-medium">Platform overview and management hub.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2 rounded-xl bg-opacity-10", stat.bg.replace('bg-', 'bg-opacity-10 bg-'), stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                {stat.label}
                            </span>
                        </div>
                        <p className="text-3xl font-black text-slate-100 tracking-tighter">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    href="/admin/opportunities/create"
                    className="group bg-blue-600 p-8 rounded-[2rem] text-white flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-900/20"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-200">
                            <PlusCircleIcon className="w-5 h-5 font-bold" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Global Stream</span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">Post New Listing</h3>
                        <p className="text-blue-100 text-sm font-medium">Add jobs, internships or walk-ins.</p>
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <ArrowRightIcon className="w-6 h-6" />
                    </div>
                </Link>

                <Link
                    href="/admin/feedback"
                    className="group bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-sm flex items-center justify-between transition-all hover:border-slate-700 hover:shadow-xl active:scale-95"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-500">
                            <ChartBarIcon className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Platform Pulse</span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-slate-100">Review Feedback</h3>
                        <p className="text-slate-400 text-sm font-medium">Analyze user reports and logs.</p>
                    </div>
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                        <ArrowRightIcon className="w-6 h-6 text-slate-100" />
                    </div>
                </Link>
            </div>

            {/* Recent Postings Simple List */}
            <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-black tracking-tight text-slate-100">Recent Activity Stream</h3>
                    <Link href="/admin/opportunities" className="text-xs font-black text-blue-400 uppercase tracking-widest hover:underline">Full Log</Link>
                </div>
                <div className="divide-y divide-slate-800">
                    {[...jobs, ...walkins]
                        .sort((a, b) => new Date(b.data.postedAt).getTime() - new Date(a.data.postedAt).getTime())
                        .slice(0, 5)
                        .map((item) => {
                            const isWalkin = item.data.type === 'WALKIN';
                            return (
                                <div key={item.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-extrabold text-slate-200 truncate">
                                            {item.data.company}
                                        </p>
                                        <p className="text-xs font-bold text-slate-500 truncate">
                                            {item.data.title || item.data.normalizedRole}
                                        </p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 text-right space-y-1">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">
                                            {new Date(item.data.postedAt).toLocaleDateString()}
                                        </span>
                                        <span className={cn(
                                            "text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full",
                                            isWalkin ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                                        )}>
                                            {item.data.type}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}

