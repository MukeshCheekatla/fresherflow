'use client';

import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { savedApi } from '@/lib/api/client';
import { Opportunity } from '@fresherflow/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPinIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SavedJobsPage() {
    const context = useContext(AuthContext);
    const user = context?.user;
    const authLoading = context?.isLoading;
    const [savedJobs, setSavedJobs] = useState<Opportunity[]>([]);
    const [fetchingJobs, setFetchingJobs] = useState(true);
    const router = useRouter();

    const loadSavedJobs = useCallback(async () => {
        setFetchingJobs(true);
        try {
            const data = await savedApi.list();
            setSavedJobs(data.opportunities || []);
        } catch (err) {
            console.error('Error loading saved jobs:', err);
            toast.error('Failed to sync saved jobs');
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
        const loading = toast.loading('Removing from saved...');
        try {
            await savedApi.toggle(id);
            setSavedJobs(prev => prev.filter(j => j.id !== id));
            toast.success('Opportunity removed', { id: loading });
        } catch {
            toast.error('Failed to remove', { id: loading });
        }
    };



    if (authLoading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="text-center space-y-6 max-w-md w-full bg-card p-8 rounded-xl border border-border shadow-lg">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign In Required</h1>
                    <p className="text-muted-foreground font-medium">Please sign in to access your saved opportunities.</p>
                    <Link href="/login" className="w-full h-11 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs rounded-lg flex items-center justify-center hover:bg-primary/90 transition-all">Go to Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background animate-in fade-in duration-500 pb-[64px] md:pb-0">
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div className="space-y-0.5">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Saved Stream</h1>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Your Curated Collection</p>
                    </div>
                </div>

                {fetchingJobs ? (
                    <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground font-medium">
                        Synchronizing your prioritized opportunities...
                    </div>
                ) : savedJobs.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-12 text-center space-y-6 max-w-2xl mx-auto shadow-sm">
                        <div className="w-16 h-16 bg-muted/40 rounded-2xl flex items-center justify-center mx-auto text-muted-foreground/50">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold tracking-tight text-foreground">No saved matches yet</h2>
                            <p className="text-muted-foreground text-sm font-medium max-w-sm mx-auto">Opportunities you bookmark from the global stream will appear here for high-speed access.</p>
                        </div>
                        <Link
                            href="/opportunities"
                            className="inline-flex h-11 items-center justify-center px-8 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-primary/90 transition-all shadow-md"
                        >
                            Browse Stream
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedJobs.map((job) => (
                            <div
                                key={job.id}
                                className="bg-card group cursor-pointer relative p-5 rounded-xl border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all space-y-4"
                                onClick={() => router.push(`/opportunities/${job.slug || job.id}`)}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{job.company}</p>
                                        <h3 className="font-bold text-foreground text-lg leading-tight truncate pr-2 group-hover:text-primary transition-colors">{job.title}</h3>
                                    </div>
                                    <button
                                        onClick={(e) => handleRemove(e, job.id)}
                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all shrink-0"
                                        title="Remove from saved"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${job.type === 'WALKIN' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                        job.type === 'INTERNSHIP' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                                            'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                        }`}>
                                        {job.type}
                                    </span>
                                    <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/80">
                                        <MapPinIcon className="w-3.5 h-3.5" />
                                        <span className="truncate max-w-[150px]">{job.locations?.[0] || 'Remote'}</span>
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

