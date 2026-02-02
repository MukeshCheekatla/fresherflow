'use client';

import { use, useState, useEffect } from 'react';
import { WalkinsService } from '@/features/walkins/services/walkins.service';
import { WalkinJob } from '@/types/walkin';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const MAJOR_CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'];

export default function EditWalkinPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: walkinId } = use(params);
    const { isAuthenticated, isLoading } = useAdmin();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/admin/login');
        } else if (isAuthenticated && walkinId) {
            fetchWalkin(walkinId);
        }
    }, [isAuthenticated, isLoading, walkinId, router]);

    const fetchWalkin = async (id: string) => {
        try {
            const result = await WalkinsService.getById(id);
            if (result) {
                const { data } = result;
                setFormData({
                    company: data.company,
                    roles: Array.isArray(data.roles) ? data.roles.join(', ') : data.roles || '',
                    experienceMin: data.experienceRange?.min ?? 0,
                    experienceMax: data.experienceRange?.max ?? 5,
                    exactAddress: data.exactAddress,
                    city: data.city,
                    walkInDate: data.walkInDate,
                    walkInTimeWindow: data.walkInTimeWindow,
                    lastValidDay: data.lastValidDay,
                });
            } else {
                alert('Walk-in not found');
                router.push('/admin/walkins');
            }
        } catch (error) {
            console.error('Error fetching walkin:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const walkinData: any = {
                company: formData.company,
                roles: formData.roles.split(',').map((s: string) => s.trim()).filter(Boolean),
                experienceRange: { min: parseInt(formData.experienceMin), max: parseInt(formData.experienceMax) },
                exactAddress: formData.exactAddress,
                city: formData.city,
                walkInDate: formData.walkInDate,
                walkInTimeWindow: formData.walkInTimeWindow,
                lastValidDay: formData.lastValidDay,
                lastVerified: new Date().toISOString(),
            };

            await WalkinsService.update(walkinId, walkinData);
            router.push('/admin/walkins');
        } catch (error) {
            console.error('Error updating walkin:', error);
            alert('Failed to update walkin');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-20 flex justify-center bg-slate-950">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );
    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-8">
            <main className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link href="/admin/walkins" className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-200 transition-colors uppercase tracking-widest mb-4">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to List
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-200">Edit Walk-in</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 space-y-6 shadow-sm">
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Company</label>
                        <input
                            type="text"
                            value={formData.company || ''}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Roles (comma-separated)</label>
                        <input
                            type="text"
                            value={formData.roles || ''}
                            onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                            className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">City</label>
                            <select
                                value={formData.city || 'Bangalore'}
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
                                value={formData.walkInDate || ''}
                                onChange={(e) => setFormData({ ...formData, walkInDate: e.target.value })}
                                className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600 p-2.5"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Exact Address</label>
                        <textarea
                            value={formData.exactAddress || ''}
                            onChange={(e) => setFormData({ ...formData, exactAddress: e.target.value })}
                            className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600 resize-none"
                            rows={3}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                    >
                        Save Changes
                    </button>
                </form>
            </main>
        </div>
    );
}
