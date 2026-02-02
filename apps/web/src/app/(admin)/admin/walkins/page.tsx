'use client';

import { useEffect } from 'react';
import { useWalkins } from '@/features/walkins/hooks/useWalkins';
import { WalkinsService } from '@/features/walkins/services/walkins.service';
import { WalkinJob } from '@/types/walkin';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/shared/components/ui/LoadingScreen';
import { TableRowSkeleton, CardSkeleton } from '@/shared/components/ui/Skeleton';

export default function AdminWalkinsList() {
    const { isAuthenticated, isLoading } = useAdmin();
    const router = useRouter();
    const { walkins: allWalkins, loading: walkinsLoading, refetch } = useWalkins();

    const walkins = allWalkins.map(w => ({ id: w.id, data: w.data }));

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/admin/login');
        }
    }, [isAuthenticated, isLoading, router]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this walk-in?')) return;
        try {
            await WalkinsService.delete(id);
            refetch();
        } catch (error) {
            console.error('Error deleting walkin:', error);
        }
    };

    const loading = isLoading || walkinsLoading;

    if (isLoading) return <LoadingScreen message="Authorizing..." />;
    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-slate-950 px-safe">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-200">Manage Walk-in Drives</h1>
                    <Link
                        href="/admin/walkins/new"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                        + Post
                    </Link>
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Company</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">City</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                            ) : (
                                walkins.map((w) => {
                                    const isExpired = new Date(w.data.lastValidDay).getTime() < Date.now();
                                    return (
                                        <tr key={w.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                    isExpired ? "bg-slate-800 text-slate-500" : "bg-emerald-900/30 text-emerald-400"
                                                )}>
                                                    {isExpired ? 'Expired' : 'Live'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-200">{w.data.company}</td>
                                            <td className="px-6 py-4 text-slate-400">{w.data.city}</td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                {new Date(w.data.walkInDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <Link
                                                    href={`/admin/walkins/${w.id}/edit`}
                                                    className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(w.id)}
                                                    className="text-red-400 hover:text-red-300 font-medium text-sm"
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
                                <div key={w.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block",
                                                isExpired ? "bg-slate-800 text-slate-500" : "bg-emerald-900/30 text-emerald-400"
                                            )}>
                                                {isExpired ? 'Expired' : 'Live'}
                                            </span>
                                            <h3 className="font-bold text-slate-200">{w.data.company}</h3>
                                            <p className="text-sm text-slate-400">{w.data.city}</p>
                                        </div>
                                        <p className="text-[10px] text-slate-500">
                                            {new Date(w.data.walkInDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                                        <Link
                                            href={`/admin/walkins/${w.id}/edit`}
                                            className="flex-1 py-2 bg-slate-950 text-slate-300 text-center rounded-lg text-sm font-medium active:bg-slate-900 border border-slate-800"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(w.id)}
                                            className="flex-1 py-2 bg-red-900/20 text-red-400 text-center rounded-lg text-sm font-medium active:bg-red-900/30 border border-red-900/20"
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
                    <div className="py-20 text-center text-slate-500 bg-slate-900 rounded-2xl border border-dashed border-slate-800">
                        No walk-ins found.
                    </div>
                )}
            </main>
        </div>
    );
}
