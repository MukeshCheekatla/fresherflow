'use client';

import { use, useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { WalkinJob } from '@/types';
import TopNav from '@/shared/components/navigation/TopNav';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const MAJOR_CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'];

export default function EditWalkinPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: walkinId } = use(params);
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        } else if (isAdmin && walkinId) {
            fetchWalkin(walkinId);
        }
    }, [isAdmin, authLoading, walkinId, router]);

    const fetchWalkin = async (id: string) => {
        if (!db) return;
        try {
            const docRef = doc(db, 'walkins', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as WalkinJob;
                setFormData({
                    company: data.company,
                    roles: data.roles.join(', '),
                    experienceMin: data.experienceRange.min,
                    experienceMax: data.experienceRange.max,
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
        if (!db) return;

        setLoading(true);
        try {
            const walkinData = {
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

            await updateDoc(doc(db, 'walkins', walkinId), walkinData);
            router.push('/admin/walkins');
        } catch (error) {
            console.error('Error updating walkin:', error);
            alert('Failed to update walkin');
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
                <h1 className="text-2xl font-bold text-neutral-900 mb-6">Edit Walk-in</h1>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">Company</label>
                        <input
                            type="text"
                            value={formData.company || ''}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">Roles (comma-separated)</label>
                        <input
                            type="text"
                            value={formData.roles || ''}
                            onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-900 mb-2">City</label>
                            <select
                                value={formData.city || 'Bangalore'}
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
                                value={formData.walkInDate || ''}
                                onChange={(e) => setFormData({ ...formData, walkInDate: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">Exact Address</label>
                        <textarea
                            value={formData.exactAddress || ''}
                            onChange={(e) => setFormData({ ...formData, exactAddress: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                            rows={3}
                            required
                        />
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
