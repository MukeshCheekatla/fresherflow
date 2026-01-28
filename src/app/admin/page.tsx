'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TopNav from '@/components/navigation/TopNav';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const COMMON_ROLES = [
    'Frontend Engineer',
    'Backend Engineer',
    'Full Stack Engineer',
    'Mobile Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Product Manager',
    'UI/UX Designer',
    'QA Engineer',
    'Marketing Manager',
];

const MAJOR_CITIES = [
    'Bangalore',
    'Mumbai',
    'Delhi',
    'Hyderabad',
    'Pune',
    'Chennai',
    'Kolkata',
    'Ahmedabad',
];

export default function AdminPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState<'online' | 'walkin'>('online');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, authLoading, router]);

    if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!isAdmin) return null;

    const [formData, setFormData] = useState({
        normalizedRole: '',
        company: '',
        experienceMin: 0,
        experienceMax: 5,
        mustHaveSkills: '',
        niceToHaveSkills: '',
        locations: [] as string[],
        workType: 'hybrid' as 'remote' | 'hybrid' | 'onsite',
        salaryMin: '',
        salaryMax: '',
        currency: 'INR',
        employmentType: 'full-time' as 'full-time' | 'contract' | 'internship',
        applyLink: '',
        source: 'Official career page',
        // Walk-in specific
        exactAddress: '',
        walkInDate: '',
        walkInTimeWindow: '',
        lastValidDay: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!db) {
            setMessage({ type: 'error', text: 'Firebase not configured. Please set up environment variables.' });
            return;
        }

        // Validation
        if (mode === 'online') {
            // Salary validation
            if (formData.salaryMin && formData.salaryMax) {
                const min = parseInt(formData.salaryMin);
                const max = parseInt(formData.salaryMax);
                if (min > max) {
                    setMessage({ type: 'error', text: 'Salary Min must be less than or equal to Salary Max' });
                    return;
                }
            }

            // Apply link validation
            if (!formData.applyLink.startsWith('http://') && !formData.applyLink.startsWith('https://')) {
                setMessage({ type: 'error', text: 'Apply link must start with http:// or https://' });
                return;
            }
        } else {
            // Walk-in date validation
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const walkInDate = new Date(formData.walkInDate);
            const lastValidDay = new Date(formData.lastValidDay);

            if (lastValidDay < today) {
                setMessage({ type: 'error', text: 'Last Valid Day cannot be in the past' });
                return;
            }

            if (walkInDate > lastValidDay) {
                setMessage({ type: 'error', text: 'Walk-in Date cannot be after Last Valid Day' });
                return;
            }
        }

        setLoading(true);
        setMessage(null);

        try {
            const collectionName = mode === 'online' ? 'jobs' : 'walkins';

            if (mode === 'online') {
                // Online job - locked schema
                const jobData = {
                    normalizedRole: formData.normalizedRole,
                    company: formData.company,
                    experienceRange: { min: formData.experienceMin, max: formData.experienceMax },
                    mustHaveSkills: formData.mustHaveSkills.split(',').map(s => s.trim()).filter(Boolean),
                    niceToHaveSkills: formData.niceToHaveSkills.split(',').map(s => s.trim()).filter(Boolean),
                    workType: formData.workType,
                    salary: formData.salaryMin && formData.salaryMax
                        ? { min: parseInt(formData.salaryMin), max: parseInt(formData.salaryMax), currency: formData.currency }
                        : null,
                    employmentType: formData.employmentType,
                    locations: formData.locations,
                    applyLink: formData.applyLink,
                    source: formData.source,
                    postedAt: new Date().toISOString(),
                    lastVerified: new Date().toISOString(),
                };

                await addDoc(collection(db, collectionName), jobData);
            } else {
                // Walk-in job - locked schema
                const walkinData = {
                    company: formData.company,
                    roles: formData.normalizedRole.split(',').map(s => s.trim()).filter(Boolean),
                    experienceRange: { min: formData.experienceMin, max: formData.experienceMax },
                    exactAddress: formData.exactAddress,
                    city: formData.locations[0] || '',
                    walkInDate: formData.walkInDate,
                    walkInTimeWindow: formData.walkInTimeWindow,
                    lastValidDay: formData.lastValidDay,
                    postedAt: new Date().toISOString(),
                    lastVerified: new Date().toISOString(),
                };

                await addDoc(collection(db, collectionName), walkinData);
            }

            setMessage({ type: 'success', text: `${mode === 'online' ? 'Job' : 'Walk-in'} posted successfully!` });

            // Reset form
            setFormData({
                normalizedRole: '',
                company: '',
                experienceMin: 0,
                experienceMax: 5,
                mustHaveSkills: '',
                niceToHaveSkills: '',
                locations: [],
                workType: 'hybrid',
                salaryMin: '',
                salaryMax: '',
                currency: 'INR',
                employmentType: 'full-time',
                applyLink: '',
                source: 'Official career page',
                exactAddress: '',
                walkInDate: '',
                walkInTimeWindow: '',
                lastValidDay: '',
            });
        } catch (error) {
            console.error('Error posting job:', error);
            setMessage({ type: 'error', text: 'Failed to post. Check console for details.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <TopNav />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Post Job</h1>
                    <p className="text-neutral-600">Admin-only job posting interface</p>
                </div>

                {/* Mode Toggle */}
                <div className="mb-6 flex gap-2 bg-neutral-100 rounded-lg p-1 w-fit">
                    <button
                        onClick={() => setMode('online')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                            mode === 'online'
                                ? "bg-white text-neutral-900 shadow-sm"
                                : "text-neutral-600 hover:text-neutral-900"
                        )}
                    >
                        Online Job
                    </button>
                    <button
                        onClick={() => setMode('walkin')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                            mode === 'walkin'
                                ? "bg-white text-neutral-900 shadow-sm"
                                : "text-neutral-600 hover:text-neutral-900"
                        )}
                    >
                        Walk-in
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div className={cn(
                        "mb-6 p-4 rounded-lg",
                        message.type === 'success' ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"
                    )}>
                        {message.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">
                            {mode === 'online' ? 'Role' : 'Role(s) (comma-separated)'}
                        </label>
                        {mode === 'online' && (
                            <select
                                value={formData.normalizedRole}
                                onChange={(e) => setFormData({ ...formData, normalizedRole: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="">Select role</option>
                                {COMMON_ROLES.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        )}
                        {mode === 'walkin' && (
                            <input
                                type="text"
                                value={formData.normalizedRole}
                                onChange={(e) => setFormData({ ...formData, normalizedRole: e.target.value })}
                                placeholder="Software Engineer, QA Engineer"
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        )}
                    </div>

                    {/* Company */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">
                            Company
                        </label>
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    {/* Experience Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-900 mb-2">
                                Min Experience (years)
                            </label>
                            <input
                                type="number"
                                value={formData.experienceMin}
                                onChange={(e) => setFormData({ ...formData, experienceMin: parseInt(e.target.value) })}
                                min={0}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-900 mb-2">
                                Max Experience (years)
                            </label>
                            <input
                                type="number"
                                value={formData.experienceMax}
                                onChange={(e) => setFormData({ ...formData, experienceMax: parseInt(e.target.value) })}
                                min={0}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                    </div>

                    {/* Online-specific fields */}
                    {mode === 'online' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-neutral-900 mb-2">
                                    Must-Have Skills (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.mustHaveSkills}
                                    onChange={(e) => setFormData({ ...formData, mustHaveSkills: e.target.value })}
                                    placeholder="React, TypeScript, Node.js"
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-900 mb-2">
                                    Nice-to-Have Skills (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.niceToHaveSkills}
                                    onChange={(e) => setFormData({ ...formData, niceToHaveSkills: e.target.value })}
                                    placeholder="Next.js, AWS, Docker"
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-900 mb-2">
                                    Work Type
                                </label>
                                <select
                                    value={formData.workType}
                                    onChange={(e) => setFormData({ ...formData, workType: e.target.value as any })}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="remote">Remote</option>
                                    <option value="hybrid">Hybrid</option>
                                    <option value="onsite">Onsite</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                                        Salary Min (optional)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.salaryMin}
                                        onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                                        placeholder="1200000"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                                        Salary Max (optional)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.salaryMax}
                                        onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                                        placeholder="1800000"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-900 mb-2">
                                    Employment Type
                                </label>
                                <select
                                    value={formData.employmentType}
                                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="full-time">Full-time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-900 mb-2">
                                    Apply Link (Career Page URL)
                                </label>
                                <input
                                    type="url"
                                    value={formData.applyLink}
                                    onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                                    placeholder="https://company.com/careers/job-id"
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Walk-in specific fields */}
                    {mode === 'walkin' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-neutral-900 mb-2">
                                    Exact Address
                                </label>
                                <textarea
                                    value={formData.exactAddress}
                                    onChange={(e) => setFormData({ ...formData, exactAddress: e.target.value })}
                                    placeholder="123 MG Road, Bangalore, Karnataka 560001"
                                    rows={3}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-900 mb-2">
                                    Walk-in Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.walkInDate}
                                    onChange={(e) => setFormData({ ...formData, walkInDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-900 mb-2">
                                    Time Window
                                </label>
                                <input
                                    type="text"
                                    value={formData.walkInTimeWindow}
                                    onChange={(e) => setFormData({ ...formData, walkInTimeWindow: e.target.value })}
                                    placeholder="10 AM - 4 PM"
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-900 mb-2">
                                    Last Valid Day
                                </label>
                                <input
                                    type="date"
                                    value={formData.lastValidDay}
                                    onChange={(e) => setFormData({ ...formData, lastValidDay: e.target.value })}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Location(s) */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">
                            {mode === 'online' ? 'Locations (select multiple)' : 'City'}
                        </label>
                        <select
                            multiple={mode === 'online'}
                            value={mode === 'online' ? formData.locations : (formData.locations[0] || '')}
                            onChange={(e) => {
                                if (mode === 'online') {
                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                    setFormData({ ...formData, locations: selected });
                                } else {
                                    setFormData({ ...formData, locations: [e.target.value] });
                                }
                            }}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        >
                            {MAJOR_CITIES.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        {mode === 'online' && (
                            <p className="mt-1 text-sm text-neutral-500">Hold Ctrl/Cmd to select multiple</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full py-3 px-4 rounded-lg font-medium transition-colors",
                            "bg-primary text-white hover:bg-primary-dark",
                            loading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {loading ? 'Posting...' : `Publish ${mode === 'online' ? 'Job' : 'Walk-in'}`}
                    </button>
                </form>
            </main>
        </div>
    );
}
