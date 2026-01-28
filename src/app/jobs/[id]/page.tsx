'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OnlineJob } from '@/lib/types';
import TopNav from '@/components/navigation/TopNav';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

import { useAuth } from '@/context/AuthContext';

export default function JobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { profile, toggleSaveJob, user } = useAuth();
    const [job, setJob] = useState<OnlineJob | null>(null);
    const [loading, setLoading] = useState(true);

    const isSaved = profile?.savedJobs.includes(params.id as string || '');

    useEffect(() => {
        if (params.id) {
            fetchJob(params.id as string);
        }
    }, [params.id]);

    const fetchJob = async (jobId: string) => {
        if (!db) {
            setLoading(false);
            return;
        }
        try {
            const jobDoc = await getDoc(doc(db, 'jobs', jobId));
            if (jobDoc.exists()) {
                setJob(jobDoc.data() as OnlineJob);
            }
        } catch (error) {
            console.error('Error fetching job:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToggle = () => {
        if (!user) {
            alert('Please sign in to save jobs');
            return;
        }
        if (params.id) toggleSaveJob(params.id as string);
    };

    const formatSalary = (salary: OnlineJob['salary']) => {
        if (!salary) return 'Not disclosed';
        const { min, max, currency } = salary;
        if (min && max) {
            return `₹${(min / 100000).toFixed(1)}L - ${(max / 100000).toFixed(1)}L per annum`;
        }
        return 'Not disclosed';
    };

    const formatExperience = (range: { min: number; max: number }) => {
        const { min, max } = range;
        if (min === 0 && max === 0) return 'Fresher';
        if (min === max) return `${min} year${min !== 1 ? 's' : ''}`;
        return `${min}-${max} years`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <TopNav />
                <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                    <div className="text-center py-12 text-neutral-600">Loading...</div>
                </main>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <TopNav />
                <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                    <div className="text-center py-12">
                        <p className="text-neutral-600 mb-4">Job not found</p>
                        <button
                            onClick={() => router.push('/jobs')}
                            className="text-primary hover:underline"
                        >
                            Back to jobs
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <TopNav />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="text-neutral-600 hover:text-neutral-900 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <button
                        onClick={handleSaveToggle}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                            isSaved
                                ? "bg-primary/5 border-primary/20 text-primary"
                                : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                        )}
                    >
                        <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        {isSaved ? "Saved" : "Save Job"}
                    </button>
                </div>

                <div className="bg-white rounded-lg border border-neutral-200 p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-semibold text-neutral-900 mb-2">
                            {job.normalizedRole}
                        </h1>
                        <div className="flex items-center gap-2 text-lg text-neutral-600 mb-4">
                            <span className="font-medium">{job.company}</span>
                            <span>•</span>
                            <span>{job.locations.join(', ')}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="px-3 py-1 bg-neutral-100 rounded-full">
                                {formatExperience(job.experienceRange)}
                            </span>
                            <span className="px-3 py-1 bg-neutral-100 rounded-full">
                                {job.workType}
                            </span>
                            <span className="px-3 py-1 bg-neutral-100 rounded-full">
                                {job.employmentType}
                            </span>
                        </div>
                    </div>

                    {/* Why this fits */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-3">
                            Why this job fits you
                        </h2>
                        <p className="text-neutral-700">
                            This position matches your profile based on the required skills and experience level.
                        </p>
                    </div>

                    {/* Who should apply */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-3">
                            Who should apply
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-neutral-700">
                            <li>Candidates with {formatExperience(job.experienceRange)} of experience</li>
                            {job.mustHaveSkills.length > 0 && (
                                <li>Proficiency in {job.mustHaveSkills.join(', ')}</li>
                            )}
                            {job.workType === 'remote' && <li>Open to remote work</li>}
                            {job.workType === 'onsite' && <li>Available for in-office work in {job.locations.join(' or ')}</li>}
                        </ul>
                    </div>

                    {/* Red flags */}
                    {!job.salary && (
                        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                                ⚠️ Note
                            </h2>
                            <p className="text-yellow-800">Salary information not disclosed</p>
                        </div>
                    )}

                    {/* Skills */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-3">
                            Required Skills
                        </h2>
                        {job.mustHaveSkills.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-neutral-700 mb-2">Must have:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {job.mustHaveSkills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {job.niceToHaveSkills.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-neutral-700 mb-2">Nice to have:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {job.niceToHaveSkills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Compensation */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-3">
                            Compensation
                        </h2>
                        <p className="text-lg text-neutral-700">{formatSalary(job.salary)}</p>
                    </div>

                    {/* Apply button */}
                    <div className="mb-6">
                        <a
                            href={job.applyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block w-full sm:w-auto px-8 py-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors text-center"
                        >
                            Apply on Company Website →
                        </a>
                    </div>

                    {/* Meta info */}
                    <div className="pt-6 border-t border-neutral-200 text-sm text-neutral-500 space-y-1">
                        <p>Posted {formatDistanceToNow(new Date(job.postedAt))} ago</p>
                        <p>Last verified {formatDistanceToNow(new Date(job.lastVerified))} ago</p>
                        <p>Source: {job.source}</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
