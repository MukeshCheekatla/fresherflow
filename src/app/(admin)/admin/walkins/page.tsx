'use client';

import { useEffect } from 'react';
import { useWalkins } from '@/features/walkins/hooks/useWalkins';
import { WalkinsService } from '@/features/walkins/services/walkins.service';
import { WalkinJob } from '@/types/walkin';
import TopNav from '@/shared/components/navigation/TopNav';
import { cn } from '@/shared/utils/cn';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/shared/components/ui/LoadingScreen';
import { TableRowSkeleton, CardSkeleton } from '@/shared/components/ui/Skeleton';

export default function AdminWalkinsList() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const { walkins: allWalkins, loading: walkinsLoading, refetch } = useWalkins();

    const walkins = allWalkins.map(w => ({ id: w.id, data: w.data }));

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, authLoading, router]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this walk-in?')) return;
        try {
            await WalkinsService.delete(id);
            refetch();
        } catch (error) {
            console.error('Error deleting walkin:', error);
        }
    };

    const loading = authLoading || walkinsLoading;

    if (authLoading) return <LoadingScreen message="Authorizing..." />;
    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-neutral-50 px-safe">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-neutral-900">Manage Walk-in Drives</h1>
                    <Link
                        href="/admin/walkins/new"
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm active:scale-95"
                    >
                        + Post
                    </Link>
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Company</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">City</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                            ) : (
                                walkins.map((w) => {
                                    const isExpired = new Date(w.data.lastValidDay).getTime() < Date.now();
                                    return (
                                        <tr key={w.id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                    isExpired ? "bg-neutral-100 text-neutral-500" : "bg-green-100 text-green-700"
                                                )}>
                                                    {isExpired ? 'Expired' : 'Live'}
                                                </span>
                                            </td>
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
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                    ) : (
                        walkins.map((w) => {
                            const isExpired = new Date(w.data.lastValidDay).getTime() < Date.now();
                            return (
                                <div key={w.id} className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block",
                                                isExpired ? "bg-neutral-100 text-neutral-500" : "bg-green-100 text-green-700"
                                            )}>
                                                {isExpired ? 'Expired' : 'Live'}
                                            </span>
                                            <h3 className="font-bold text-neutral-900">{w.data.company}</h3>
                                            <p className="text-sm text-neutral-500">{w.data.city}</p>
                                        </div>
                                        <p className="text-[10px] text-neutral-400">
                                            {new Date(w.data.walkInDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 pt-2 border-t border-neutral-50">
                                        <Link
                                            href={`/admin/walkins/${w.id}/edit`}
                                            className="flex-1 py-2 bg-neutral-50 text-neutral-900 text-center rounded-lg text-sm font-medium active:bg-neutral-100"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(w.id)}
                                            className="flex-1 py-2 bg-red-50 text-red-600 text-center rounded-lg text-sm font-medium active:bg-red-100"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {walkins.length === 0 && (
                    <div className="py-20 text-center text-neutral-500 bg-white rounded-2xl border border-dashed border-neutral-300">
                        No walk-ins found.
                    </div>
                )}
            </main>
        </div>
    );
}
