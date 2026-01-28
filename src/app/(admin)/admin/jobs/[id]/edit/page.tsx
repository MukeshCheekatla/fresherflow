'use client';

import { use, useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { OnlineJob } from '@/types';
import TopNav from '@/shared/components/navigation/TopNav';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const COMMON_ROLES = [
    'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer',
    'Mobile Developer', 'DevOps Engineer', 'Data Scientist',
    'Product Manager', 'UI/UX Designer', 'QA Engineer'
];

const MAJOR_CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'];

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrapping params using React.use()
    const { id: jobId } = use(params);
    const { isAdmin, loading: authLoading } = useAuth();
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
        if (!db) return;
        try {
            const docRef = doc(db, 'jobs', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as OnlineJob;
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
        if (!db) return;

        setLoading(true);
        try {
            const jobData = {
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

            await updateDoc(doc(db, 'jobs', jobId), jobData);
            router.push('/admin/jobs');
        } catch (error) {
            console.error('Error updating job:', error);
            alert('Failed to update job');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen pt-20 text-center">Loading...</div>;
    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-neutral-50">
            <TopNav />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-2xl font-bold text-neutral-900 mb-6">Edit Job</h1>

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
                                onChange={(e) => setFormData({ ...formData, experienceMin: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-900 mb-2">Max Exp (Yrs)</label>
                            <input
                                type="number"
                                value={formData.experienceMax}
                                onChange={(e) => setFormData({ ...formData, experienceMax: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    {/* Salary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-900 mb-2">Min Salary</label>
                            <input
                                type="number"
                                value={formData.salaryMin}
                                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-900 mb-2">Max Salary</label>
                            <input
                                type="number"
                                value={formData.salaryMax}
                                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        Save Changes
                    </button>
                </form>
            </main>
        </div>
    );
}
