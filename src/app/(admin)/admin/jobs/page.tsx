import { useEffect } from 'react';

import { useJobs } from '@/features/jobs/hooks/useJobs';
import { JobsService } from '@/features/jobs/services/jobs.service';
import { OnlineJob } from '@/types/job';
import TopNav from '@/shared/components/navigation/TopNav';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/utils/cn';

export default function AdminJobsList() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const { jobs: allJobs, loading: jobsLoading, refetch } = useJobs(100);

    const jobs = allJobs.map(j => ({ id: j.id, data: j.data }));

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, authLoading, router]);

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

    const loading = authLoading || jobsLoading;

    if (authLoading || loading) return <div className="min-h-screen pt-20 text-center">Loading...</div>;
    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-neutral-50">
            <TopNav />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-neutral-900">Manage Online Jobs</h1>
                    <Link
                        href="/admin/jobs/new"
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                    >
                        + Post New Job
                    </Link>
                </div>

                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Company</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Posted</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {jobs.map((job) => (
                                <tr key={job.id} className="hover:bg-neutral-50 transition-colors">
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
                            ))}
                            {jobs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                                        No jobs posted yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
