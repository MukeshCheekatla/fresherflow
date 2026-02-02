'use client';

import { use, useState, useEffect } from 'react';
import { JobsService } from '@/features/jobs/services/jobs.service';
import { OnlineJob } from '@/types/job';
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

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrapping params using React.use()
    const { id: jobId } = use(params);
    const { isAuthenticated: isAdmin, isLoading: authLoading } = useAdmin();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    // Using partial state since we load data
    const [formData, setFormData] = useState<any>({
        locations: [],
        workType: 'hybrid',
    });

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        } else if (isAdmin && jobId) {
            fetchJob(jobId);
        }
    }, [isAdmin, authLoading, jobId, router]);

    const fetchJob = async (id: string) => {
        try {
            const result = await JobsService.getById(id);
            if (result) {
                const { data } = result;
                // Flatten constraints for form
                setFormData({
                    normalizedRole: data.normalizedRole,
                    company: data.company,
                    experienceMin: data.experienceRange.min,
                    experienceMax: data.experienceRange.max,
                    mustHaveSkills: data.mustHaveSkills.join(', '),
                    niceToHaveSkills: data.niceToHaveSkills.join(', '),
                    workType: data.workType,
                    salaryMin: data.salary?.min || '',
                    salaryMax: data.salary?.max || '',
                    currency: data.salary?.currency || 'INR',
                    employmentType: data.employmentType,
                    locations: data.locations,
                    applyLink: data.applyLink,
                    source: data.source,
                });
            } else {
                alert('Job not found');
                router.push('/admin/jobs');
            }
        } catch (error) {
            console.error('Error fetching job:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const jobData: Partial<OnlineJob> = {
                normalizedRole: formData.normalizedRole,
                company: formData.company,
                experienceRange: { min: parseInt(formData.experienceMin), max: parseInt(formData.experienceMax) },
                mustHaveSkills: formData.mustHaveSkills.split(',').map((s: string) => s.trim()).filter(Boolean),
                niceToHaveSkills: formData.niceToHaveSkills.split(',').map((s: string) => s.trim()).filter(Boolean),
                workType: formData.workType,
                salary: formData.salaryMin && formData.salaryMax
                    ? { min: parseInt(formData.salaryMin), max: parseInt(formData.salaryMax), currency: formData.currency }
                    : null,
                employmentType: formData.employmentType,
                locations: formData.locations,
                applyLink: formData.applyLink,
                source: formData.source,
                lastVerified: new Date().toISOString(),
            };

            await JobsService.update(jobId, jobData);
            router.push('/admin/jobs');
        } catch (error) {
            console.error('Error updating job:', error);
            alert('Failed to update job');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-20 flex justify-center bg-slate-950">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );
    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-8">
            <main className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link href="/admin/jobs" className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-200 transition-colors uppercase tracking-widest mb-4">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to List
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-200">Edit Job</h1>
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
                                onChange={(e) => setFormData({ ...formData, experienceMin: e.target.value })}
                                className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Max Exp (Yrs)</label>
                            <input
                                type="number"
                                value={formData.experienceMax}
                                onChange={(e) => setFormData({ ...formData, experienceMax: e.target.value })}
                                className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600"
                                required
                            />
                        </div>
                    </div>

                    {/* Salary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Min Salary</label>
                            <input
                                type="number"
                                value={formData.salaryMin}
                                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                                className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Max Salary</label>
                            <input
                                type="number"
                                value={formData.salaryMax}
                                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                                className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                    >
                        Save Changes
                    </button>
                </form>
            </main>
        </div>
    );
}
