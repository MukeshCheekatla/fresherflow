'use client';

import { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { WalkinJob } from '@/types';
import TopNav from '@/shared/components/navigation/TopNav';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminWalkinsList() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [walkins, setWalkins] = useState<{ id: string; data: WalkinJob }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        } else if (isAdmin) {
            fetchWalkins();
        }
    }, [isAdmin, authLoading, router]);

    const fetchWalkins = async () => {
        if (!db) return;
        try {
            const q = query(collection(db, 'walkins'), orderBy('walkInDate', 'desc'));
            const snapshot = await getDocs(q);
            setWalkins(snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() as WalkinJob })));
        } catch (error) {
            console.error('Error fetching walkins:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this walk-in?')) return;
        if (!db) return;
        try {
            await deleteDoc(doc(db, 'walkins', id));
            setWalkins(walkins.filter(w => w.id !== id));
        } catch (error) {
            console.error('Error deleting walkin:', error);
        }
    };

    if (authLoading || loading) return <div className="min-h-screen pt-20 text-center">Loading...</div>;
    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-neutral-50">
            <TopNav />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-neutral-900">Manage Walk-in Drives</h1>
                    <Link
                        href="/admin/walkins/new"
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                    >
                        + Post Walk-in
                    </Link>
                </div>

                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Company</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">City</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {walkins.map((w) => (
                                <tr key={w.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-neutral-900">{w.data.company}</td>
                                    <td className="px-6 py-4 text-neutral-600">{w.data.city}</td>
                                    <td className="px-6 py-4 text-neutral-500 text-sm">
                                        {new Date(w.data.walkInDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <Link
                                            href={`/admin/walkins/${w.id}/edit`}
                                            className="text-primary hover:text-primary-dark font-medium text-sm"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(w.id)}
                                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
