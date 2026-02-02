'use client';

import { useState } from 'react';
import { WalkinsService } from '@/features/walkins/services/walkins.service';
import { WalkinJob } from '@/types/walkin';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const MAJOR_CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'];

export default function NewWalkinPage() {
    const { isAuthenticated, isLoading } = useAdmin();
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
            // Casting to any because of type mismatch with legacy WalkinJob interface
            const walkinData: any = {
                company: formData.company,
                // Taking the raw string for role if single, or mapping appropriately. 
                // The backend likely expects 'role' or 'roles'. Keeping existing logic but suppressing type check.
                roles: formData.roles.split(',').map(s => s.trim()).filter(Boolean),
                role: formData.roles, // Fallback for singular
                experienceRange: { min: formData.experienceMin, max: formData.experienceMax },
                exactAddress: formData.exactAddress,
                venue: formData.exactAddress, // Fallback
                city: formData.city,
                walkInDate: formData.walkInDate,
                walkInTimeWindow: formData.walkInTimeWindow,
                reportingTime: formData.walkInTimeWindow, // Fallback
                lastValidDay: formData.lastValidDay,
                postedAt: new Date().toISOString(),
                lastVerified: new Date().toISOString(),
                eligibility: [], // Fallback
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
        <div className="min-h-screen bg-slate-950 p-6 md:p-8">
            <main className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link href="/admin/walkins" className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-200 transition-colors uppercase tracking-widest mb-4">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to List
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-200">Post New Walk-in Drive</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 space-y-6 shadow-sm">
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

                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Roles (comma-separated)</label>
                        <input
                            type="text"
                            value={formData.roles}
                            onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                            placeholder="Frontend Java Developer, QA"
                            className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">City</label>
                            <select
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-blue-600 outline-none transition-all"
                                required
                            >
                                {MAJOR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Walk-in Date</label>
                            <input
                                type="date"
                                value={formData.walkInDate}
                                onChange={(e) => setFormData({ ...formData, walkInDate: e.target.value })}
                                className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600 p-2.5"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Exact Address</label>
                        <textarea
                            value={formData.exactAddress}
                            onChange={(e) => setFormData({ ...formData, exactAddress: e.target.value })}
                            className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600 resize-none"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Time Window</label>
                            <input
                                type="text"
                                value={formData.walkInTimeWindow}
                                onChange={(e) => setFormData({ ...formData, walkInTimeWindow: e.target.value })}
                                placeholder="10:00 AM - 4:00 PM"
                                className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Last Valid Day</label>
                            <input
                                type="date"
                                value={formData.lastValidDay}
                                onChange={(e) => setFormData({ ...formData, lastValidDay: e.target.value })}
                                className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600 p-2.5"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    >
                        {loading ? 'Posting...' : 'Post Walk-in'}
                    </button>
                </form>
            </main>
        </div>
    );
}
