'use client';

// Reusing form logic but tailored for "New Job"
import { useState } from 'react';
import { JobsService } from '@/features/jobs/services/jobs.service';
import { OnlineJob } from '@/types/job';
import TopNav from '@/shared/components/navigation/TopNav';
import { cn } from '@/shared/utils/cn';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const COMMON_ROLES = [
    'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer',
    'Mobile Developer', 'DevOps Engineer', 'Data Scientist',
    'Product Manager', 'UI/UX Designer', 'QA Engineer'
];

const MAJOR_CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'];

export default function NewJobPage() {
    const { isAdmin, loading: authLoading } = useAuth();
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

    if (authLoading) return null;
    if (!isAdmin) {
        router.push('/');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const jobData: Omit<OnlineJob, 'id'> = {
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
        <div className="min-h-screen bg-neutral-50">
            <TopNav />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-neutral-900">Post New Online Job</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">Role</label>
                        <select
                            value={formData.normalizedRole}
                            onChange={(e) => setFormData({ ...formData, normalizedRole: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                            required
                        >
                            <option value="">Select role</option>
                            {COMMON_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>

                    {/* Company */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">Company</label>
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                            required
                        />
                    </div>

                    {/* Experience */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-900 mb-2">Min Exp (Yrs)</label>
                            <input
                                type="number"
                                value={formData.experienceMin}
                                onChange={(e) => setFormData({ ...formData, experienceMin: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-900 mb-2">Max Exp (Yrs)</label>
                            <input
                                type="number"
                                value={formData.experienceMax}
                                onChange={(e) => setFormData({ ...formData, experienceMax: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">Must-Have Skills</label>
                        <input
                            type="text"
                            value={formData.mustHaveSkills}
                            onChange={(e) => setFormData({ ...formData, mustHaveSkills: e.target.value })}
                            placeholder="React, Node.js, AWS"
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                        />
                    </div>

                    {/* Work Type */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">Work Type</label>
                        <select
                            value={formData.workType}
                            onChange={(e) => setFormData({ ...formData, workType: e.target.value as any })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                        >
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="onsite">Onsite</option>
                        </select>
                    </div>

                    {/* Locations */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">Locations</label>
                        <select
                            multiple
                            value={formData.locations}
                            onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                setFormData({ ...formData, locations: selected });
                            }}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg h-32"
                            required
                        >
                            {MAJOR_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                        <p className="text-xs text-neutral-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>

                    {/* Apply Link */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">Apply Link</label>
                        <input
                            type="url"
                            value={formData.applyLink}
                            onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                            placeholder="https://company.com/careers"
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Posting...' : 'Post Job'}
                    </button>
                </form>
            </main>
        </div>
    );
}
