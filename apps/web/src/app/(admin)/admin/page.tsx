'use client';

import { useJobs } from '@/features/jobs/hooks/useJobs';
import { useWalkins } from '@/features/walkins/hooks/useWalkins';
import { cn } from '@/lib/utils';
import LoadingScreen from '@/shared/components/ui/LoadingScreen';
import TopNav from '@/shared/components/navigation/TopNav';
import Link from 'next/link';

export default function AdminDashboardHome() {
    const { jobs, loading: jobsLoading } = useJobs();
    const { walkins, loading: walkinsLoading } = useWalkins();

    const liveJobsCount = jobs.length;
    const walkinsCount = walkins.length;

    const stats = [
        { label: 'Live Online Jobs', value: liveJobsCount, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Walk-in Drives', value: walkinsCount, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Total Postings', value: liveJobsCount + walkinsCount, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Recent (24h)', value: 0, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    if (jobsLoading || walkinsLoading) {
        return <LoadingScreen message="Loading Dashboard Summary..." />;
    }

    return (
        <div className="min-h-screen bg-neutral-50 px-safe">
            <TopNav />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-neutral-900">Admin Command Center</h1>
                    <p className="text-neutral-600">Overview of your job board's activity</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className={`${stat.bg} p-4 rounded-2xl border border-white shadow-sm transition-transform active:scale-95`}>
                            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Link
                        href="/admin/jobs/new"
                        className="group flex items-center justify-between p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:border-primary transition-all active:scale-[0.98]"
                    >
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary transition-colors">Post Online Job</h3>
                            <p className="text-sm text-neutral-500">Add a new remote or onsite listing</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                    </Link>

                    <Link
                        href="/admin/walkins/new"
                        className="group flex items-center justify-between p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:border-primary transition-all active:scale-[0.98]"
                    >
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary transition-colors">Post Walk-in</h3>
                            <p className="text-sm text-neutral-500">Schedule a new recruitment drive</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                        </div>
                    </Link>
                </div>

                {/* Recent Items Section could go here */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
                        <h2 className="font-bold text-neutral-900">Recent Postings</h2>
                        <Link href="/admin/jobs" className="text-xs font-semibold text-primary hover:underline">View All</Link>
                    </div>
                    <div className="divide-y divide-neutral-50">
                        {[...jobs, ...walkins]
                            .sort((a, b) => new Date(b.data.postedAt).getTime() - new Date(a.data.postedAt).getTime())
                            .slice(0, 5)
                            .map((item) => {
                                const isWalkin = 'walkInDate' in item.data;
                                return (
                                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-neutral-900 text-sm truncate">
                                                {item.data.company}
                                            </p>
                                            <p className="text-xs text-neutral-500 truncate">
                                                {isWalkin
                                                    ? (item.data as any).roles.join(', ')
                                                    : (item.data as any).title || (item.data as any).normalizedRole}
                                            </p>
                                        </div>
                                        <div className="ml-4 flex-shrink-0 text-right">
                                            <span className="text-[10px] text-neutral-400 block">
                                                {new Date(item.data.postedAt).toLocaleDateString()}
                                            </span>
                                            <span className={cn(
                                                "text-[8px] uppercase font-bold tracking-tighter px-1 rounded",
                                                isWalkin ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                            )}>
                                                {isWalkin ? 'Walkin' : 'Job'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </main>
        </div>
    );
}
