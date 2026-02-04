'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { actionsApi } from '@/lib/api/client';
import { Opportunity } from '@fresherflow/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPinIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SavedJobsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [savedJobs, setSavedJobs] = useState<Opportunity[]>([]);
    const [fetchingJobs, setFetchingJobs] = useState(true);
    const router = useRouter();

    const loadSavedJobs = useCallback(async () => {
        setFetchingJobs(true);
        try {
            const actions = await actionsApi.list();
            // Assuming actions returns [{ opportunity: Opportunity, actionType: string }]
            const saved = actions
                .filter((a: { actionType: string }) => a.actionType === 'PLANNING')
                .map((a: { opportunity: Opportunity }) => a.opportunity);
            setSavedJobs(saved);
        } catch (err: unknown) {
            const error = err as Error;
            console.error('Error loading saved jobs:', error);
            toast.error('Failed to sync saved stream');
        } finally {
            setFetchingJobs(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            loadSavedJobs();
        }
    }, [user, loadSavedJobs]);

    const handleRemove = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const loading = toast.loading('Removing from stream...');
        try {
            // In a real app, we might have an 'UNSAVE' or just delete the action.
            // For now, tracking as 'REMOVED' or similar if supported, or just omit.
            // Assuming toggle is not yet implemented in backend, we just track a different state or ignore.
            // If the backend doesn't support 'UNSAVE', we might just filter locally for demo if needed.
            // But let's assume we can track it as something else.
            await actionsApi.track(id, 'IGNORED');
            setSavedJobs(prev => prev.filter(j => j.id !== id));
            toast.success('Opportunity removed', { id: loading });
        } catch {
            toast.error('Failed to remove', { id: loading });
        }
    };

    const loading = authLoading;

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" /></div>;

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
                <div className="text-center space-y-6">
                    <h1 className="tracking-tighter">Please sign in</h1>
                    <p className="text-slate-500 font-medium tracking-tight">You need to be signed in to view saved jobs.</p>
                    <Link href="/login" className="premium-button bg-slate-900 text-white mx-auto">Go to Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 animate-in fade-in duration-700 pb-[64px] md:pb-0">
            <main className="max-content py-10 space-y-12">
                <div className="flex items-center gap-4">
                    <Link
                        href="/account"
                        className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="tracking-tighter">Saved Stream</h1>
                </div>

                {fetchingJobs ? (
                    <div className="job-card text-center py-12 text-slate-400 font-bold">
                        Synchronizing your prioritized opportunities...
                    </div>
                ) : savedJobs.length === 0 ? (
                    <div className="job-card text-center py-16 space-y-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="tracking-tight">No saved matches yet</h2>
                            <p className="text-slate-500 font-medium">Opportunities you bookmark will appear here for high-speed access.</p>
                        </div>
                        <Link
                            href="/opportunities"
                            className="premium-button bg-slate-900 text-white inline-flex"
                        >
                            Browse Stream
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {savedJobs.map((job) => (
                            <div
                                key={job.id}
                                className="job-card group cursor-pointer relative"
                                onClick={() => router.push(`/opportunities/${job.id}`)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.company}</p>
                                        <h3 className="group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                    </div>
                                    <button
                                        onClick={(e) => handleRemove(e, job.id)}
                                        className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                        title="Remove from saved"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-4 border-t border-slate-50">
                                    <span className="flex items-center gap-1">
                                        <MapPinIcon className="w-4 h-4" />
                                        {job.locations?.[0] || 'Multiple Locations'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${job.type === 'WALKIN' ? 'bg-orange-50 text-orange-600' :
                                        job.type === 'INTERNSHIP' ? 'bg-purple-50 text-purple-600' :
                                            'bg-blue-50 text-blue-600'
                                        }`}>
                                        {job.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

