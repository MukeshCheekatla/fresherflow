'use client';

import { useState } from 'react';
import { Opportunity } from '@fresherflow/types';
import { JobsService } from '@/features/jobs/services/jobs.service';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const COMMON_ROLES = [
    'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer',
    'Mobile Developer', 'DevOps Engineer', 'Data Scientist',
    'Product Manager', 'UI/UX Designer', 'QA Engineer'
];

const MAJOR_CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'];

export default function NewJobPage() {
    const { isAuthenticated, isLoading } = useAdmin();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

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
    });

    if (isLoading) return (
        <div className="min-h-screen pt-20 flex justify-center bg-slate-950">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );
    if (!isAuthenticated) {
        router.push('/admin/login');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const jobData: any = {
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

            await JobsService.create(jobData);
            router.push('/admin/jobs');
        } catch (error) {
            console.error('Error posting job:', error);
            alert('Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-8">
            <main className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link href="/admin/jobs" className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-200 transition-colors uppercase tracking-widest mb-4">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to List
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-200">Post New Online Job</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 space-y-6 shadow-sm">
                    {/* Role */}
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Role</label>
                        <select
                            value={formData.normalizedRole}
                            onChange={(e) => setFormData({ ...formData, normalizedRole: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-blue-600 outline-none transition-all"
                            required
                        >
                            <option value="">Select role</option>
                            {COMMON_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>

                    {/* Company */}
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Company</label>
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600"
                            required
                        />
                    </div>

                    {/* Experience */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Min Exp (Yrs)</label>
                            <input
                                type="number"
                                value={formData.experienceMin}
                                onChange={(e) => setFormData({ ...formData, experienceMin: parseInt(e.target.value) })}
                                className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Max Exp (Yrs)</label>
                            <input
                                type="number"
                                value={formData.experienceMax}
                                onChange={(e) => setFormData({ ...formData, experienceMax: parseInt(e.target.value) })}
                                className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600"
                                required
                            />
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Must-Have Skills</label>
                        <input
                            type="text"
                            value={formData.mustHaveSkills}
                            onChange={(e) => setFormData({ ...formData, mustHaveSkills: e.target.value })}
                            placeholder="React, Node.js, AWS"
                            className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600"
                        />
                    </div>

                    {/* Work Type */}
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Work Type</label>
                        <select
                            value={formData.workType}
                            onChange={(e) => setFormData({ ...formData, workType: e.target.value as any })}
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-blue-600 outline-none transition-all"
                        >
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="onsite">Onsite</option>
                        </select>
                    </div>

                    {/* Locations */}
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Locations</label>
                        <select
                            multiple
                            value={formData.locations}
                            onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                setFormData({ ...formData, locations: selected });
                            }}
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-blue-600 outline-none transition-all h-32"
                            required
                        >
                            {MAJOR_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>

                    {/* Apply Link */}
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Apply Link</label>
                        <input
                            type="url"
                            value={formData.applyLink}
                            onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                            placeholder="https://company.com/careers"
                            className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    >
                        {loading ? 'Posting...' : 'Post Job'}
                    </button>
                </form>
            </main>
        </div>
    );
}

