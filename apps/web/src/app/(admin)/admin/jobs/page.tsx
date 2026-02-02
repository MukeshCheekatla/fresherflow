'use client';

import { useEffect } from 'react';

import { useJobs } from '@/features/jobs/hooks/useJobs';
import { JobsService } from '@/features/jobs/services/jobs.service';
import { OnlineJob } from '@/types/job';
import TopNav from '@/shared/components/navigation/TopNav';
import Link from 'next/link';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import LoadingScreen from '@/shared/components/ui/LoadingScreen';
import { TableRowSkeleton, CardSkeleton } from '@/shared/components/ui/Skeleton';

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
        <div className="min-h-screen bg-neutral-50 px-safe">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-neutral-900">Manage Online Jobs</h1>
                    <Link
                        href="/admin/jobs/new"
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm active:scale-95"
                    >
                        + Post
                    </Link>
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Company</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Posted</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                            ) : (
                                jobs.map((job) => {
                                    const isExpired = new Date(job.data.postedAt).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000;
                                    return (
                                        <tr key={job.id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                    isExpired ? "bg-neutral-100 text-neutral-500" : "bg-green-100 text-green-700"
                                                )}>
                                                    {isExpired ? 'Expired' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-neutral-900">{job.data.normalizedRole}</td>
                                            <td className="px-6 py-4 text-neutral-600">{job.data.company}</td>
                                            <td className="px-6 py-4 text-neutral-500 text-sm">
                                                {new Date(job.data.postedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <Link
                                                    href={`/admin/jobs/${job.id}/edit`}
                                                    className="text-primary hover:text-primary-dark font-medium text-sm"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(job.id)}
                                                    className="text-red-600 hover:text-red-700 font-medium text-sm"
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
                                <div key={job.id} className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block",
                                                isExpired ? "bg-neutral-100 text-neutral-500" : "bg-green-100 text-green-700"
                                            )}>
                                                {isExpired ? 'Expired' : 'Active'}
                                            </span>
                                            <h3 className="font-bold text-neutral-900">{job.data.normalizedRole}</h3>
                                            <p className="text-sm text-neutral-500">{job.data.company}</p>
                                        </div>
                                        <p className="text-[10px] text-neutral-400">
                                            {new Date(job.data.postedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 pt-2 border-t border-neutral-50">
                                        <Link
                                            href={`/admin/jobs/${job.id}/edit`}
                                            className="flex-1 py-2 bg-neutral-50 text-neutral-900 text-center rounded-lg text-sm font-medium active:bg-neutral-100"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            className="flex-1 py-2 bg-red-50 text-red-600 text-center rounded-lg text-sm font-medium active:bg-red-100"
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
                    <div className="py-20 text-center text-neutral-500 bg-white rounded-2xl border border-dashed border-neutral-300">
                        No jobs found.
                    </div>
                )}
            </main>
        </div>
    );
}
