'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { OnlineJob } from '@/lib/types';
import TopNav from '@/components/navigation/TopNav';
import JobCard from '@/components/jobs/JobCard';
import Link from 'next/link';

export default function SavedJobsPage() {
    const { user, profile, loading } = useAuth();
    const [savedJobs, setSavedJobs] = useState<{ id: string; data: OnlineJob }[]>([]);
    const [fetchingJobs, setFetchingJobs] = useState(false);

    useEffect(() => {
        if (profile?.savedJobs && profile.savedJobs.length > 0) {
            fetchJobs(profile.savedJobs);
        } else {
            setSavedJobs([]);
        }
    }, [profile?.savedJobs]);

    const fetchJobs = async (jobIds: string[]) => {
        if (!db) return;
        try {
            setFetchingJobs(true);
            const q = query(
                collection(db, 'jobs'),
                where(documentId(), 'in', jobIds.slice(0, 10))
            );
            const snapshot = await getDocs(q);
            const jobs = snapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data() as OnlineJob
            }));
            setSavedJobs(jobs);
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
        } finally {
            setFetchingJobs(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <TopNav />
                <main className="max-w-3xl mx-auto px-4 py-8 text-center text-neutral-600">
                    Loading...
                </main>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <TopNav />
                <main className="max-w-3xl mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
                    <p className="text-neutral-600 mb-6">You need to be signed in to view saved jobs.</p>
                    <Link href="/" className="text-primary hover:underline">Go back to home</Link>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <TopNav />
            <main className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/account"
                        className="p-2 -ml-2 text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-3xl font-bold text-neutral-900">Saved Jobs</h1>
                </div>

                {fetchingJobs ? (
                    <div className="text-center py-12 text-neutral-600">
                        Fetching your saved jobs...
                    </div>
                ) : savedJobs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200 p-8">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 mb-2">No saved jobs yet</h2>
                        <p className="text-neutral-600 mb-6">Jobs you bookmark will appear here for easy access.</p>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                        >
                            Browse Jobs
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {savedJobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job.data}
                                jobId={job.id}
                                onClick={() => window.location.href = `/jobs/${job.id}`}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
