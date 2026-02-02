'use client';

import { useEffect } from 'react';

import { useJobs } from '@/features/jobs/hooks/useJobs';
import { JobsService } from '@/features/jobs/services/jobs.service';
import { OnlineJob } from '@/types/job';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import LoadingScreen from '@/shared/components/ui/LoadingScreen';
import { TableRowSkeleton, CardSkeleton } from '@/shared/components/ui/Skeleton';
import Link from 'next/link';

export default function AdminJobsList() {
    const { isAuthenticated, isLoading } = useAdmin();
    const router = useRouter();
    const { jobs: allJobs, loading: jobsLoading, refetch } = useJobs(100);

    const jobs = allJobs.map(j => ({ id: j.id, data: j.data }));

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/admin/login');
        }
    }, [isAuthenticated, isLoading, router]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return;
        try {
            await JobsService.delete(id);
            refetch();
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete job');
        }
    };

    const loading = isLoading || jobsLoading;

    if (isLoading) return <LoadingScreen message="Authorizing..." />;
    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-slate-950 px-safe">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-200">Manage Online Jobs</h1>
                    <Link
                        href="/admin/jobs/new"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                        + Post
                    </Link>
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Company</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Posted</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                            ) : (
                                jobs.map((job) => {
                                    const isExpired = new Date(job.data.postedAt).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000;
                                    return (
                                        <tr key={job.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                    isExpired ? "bg-slate-800 text-slate-500" : "bg-emerald-900/30 text-emerald-400"
                                                )}>
                                                    {isExpired ? 'Expired' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-200">{job.data.normalizedRole}</td>
                                            <td className="px-6 py-4 text-slate-400">{job.data.company}</td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                {new Date(job.data.postedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <Link
                                                    href={`/admin/jobs/${job.id}/edit`}
                                                    className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(job.id)}
                                                    className="text-red-400 hover:text-red-300 font-medium text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                    ) : (
                        jobs.map((job) => {
                            const isExpired = new Date(job.data.postedAt).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000;
                            return (
                                <div key={job.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block",
                                                isExpired ? "bg-slate-800 text-slate-500" : "bg-emerald-900/30 text-emerald-400"
                                            )}>
                                                {isExpired ? 'Expired' : 'Active'}
                                            </span>
                                            <h3 className="font-bold text-slate-200">{job.data.normalizedRole}</h3>
                                            <p className="text-sm text-slate-400">{job.data.company}</p>
                                        </div>
                                        <p className="text-[10px] text-slate-500">
                                            {new Date(job.data.postedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                                        <Link
                                            href={`/admin/jobs/${job.id}/edit`}
                                            className="flex-1 py-2 bg-slate-950 text-slate-300 text-center rounded-lg text-sm font-medium active:bg-slate-900 border border-slate-800"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            className="flex-1 py-2 bg-red-900/20 text-red-400 text-center rounded-lg text-sm font-medium active:bg-red-900/30 border border-red-900/20"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {jobs.length === 0 && (
                    <div className="py-20 text-center text-slate-500 bg-slate-900 rounded-2xl border border-dashed border-slate-800">
                        No jobs found.
                    </div>
                )}
            </main>
        </div>
    );
}
