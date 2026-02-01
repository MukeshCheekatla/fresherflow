'use client';

import { useState } from 'react';
import { WalkinsService } from '@/features/walkins/services/walkins.service';
import { WalkinJob } from '@/types/walkin';
import TopNav from '@/shared/components/navigation/TopNav';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const MAJOR_CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'];

export default function NewWalkinPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        company: '',
        roles: '',
        experienceMin: 0,
        experienceMax: 5,
        exactAddress: '',
        city: 'Bangalore',
        walkInDate: '',
        walkInTimeWindow: '',
        lastValidDay: '',
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
            const walkinData: Omit<WalkinJob, 'id'> = {
                company: formData.company,
                roles: formData.roles.split(',').map(s => s.trim()).filter(Boolean),
                experienceRange: { min: formData.experienceMin, max: formData.experienceMax },
                exactAddress: formData.exactAddress,
                city: formData.city,
                walkInDate: formData.walkInDate,
                walkInTimeWindow: formData.walkInTimeWindow,
                lastValidDay: formData.lastValidDay,
                postedAt: new Date().toISOString(),
                lastVerified: new Date().toISOString(),
            };

            await WalkinsService.create(walkinData);
            router.push('/admin/walkins');
        } catch (error) {
            console.error('Error posting walkin:', error);
            alert('Failed to post walk-in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <TopNav />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-2xl font-bold text-neutral-900 mb-6">Post New Walk-in Drive</h1>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
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

                    <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">Roles (comma-separated)</label>
                        <input
                            type="text"
                            value={formData.roles}
                            onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                            placeholder="Frontend Java Developer, QA"
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-900 mb-2">City</label>
                            <select
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                                required
                            >
                                {MAJOR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-900 mb-2">Walk-in Date</label>
                            <input
                                type="date"
                                value={formData.walkInDate}
                                onChange={(e) => setFormData({ ...formData, walkInDate: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">Exact Address</label>
                        <textarea
                            value={formData.exactAddress}
                            onChange={(e) => setFormData({ ...formData, exactAddress: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-900 mb-2">Time Window</label>
                            <input
                                type="text"
                                value={formData.walkInTimeWindow}
                                onChange={(e) => setFormData({ ...formData, walkInTimeWindow: e.target.value })}
                                placeholder="10:00 AM - 4:00 PM"
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-900 mb-2">Last Valid Day</label>
                            <input
                                type="date"
                                value={formData.lastValidDay}
                                onChange={(e) => setFormData({ ...formData, lastValidDay: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Posting...' : 'Post Walk-in'}
                    </button>
                </form>
            </main>
        </div>
    );
}
