'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { Alert } from '@/lib/types';
import TopNav from '@/components/navigation/TopNav';
import AlertForm from '@/components/alerts/AlertForm';
import { cn } from '@/lib/utils';

export default function AlertsPage() {
    const { user, loading: authLoading } = useAuth();
    const [alerts, setAlerts] = useState<{ id: string; data: Alert }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (user) {
            fetchAlerts();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const fetchAlerts = async () => {
        if (!user || !db) return;
        try {
            setLoading(true);
            const q = query(
                collection(db, 'alerts'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const alertsData = snapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data() as Alert
            }));
            setAlerts(alertsData);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteAlert = async (id: string) => {
        if (!db) return;
        try {
            await deleteDoc(doc(db, 'alerts', id));
            setAlerts(alerts.filter(a => a.id !== id));
        } catch (error) {
            console.error('Error deleting alert:', error);
        }
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-neutral-50">
            <TopNav />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Job Alerts</h1>
                        <p className="text-neutral-600">Get notified when we find your perfect match</p>
                    </div>
                    {!showForm && user && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                        >
                            Create Alert
                        </button>
                    )}
                </div>

                {showForm ? (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-8 mb-8">
                        <h2 className="text-xl font-bold text-neutral-900 mb-6">New Job Alert</h2>
                        <AlertForm
                            onSuccess={() => {
                                setShowForm(false);
                                fetchAlerts();
                            }}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                ) : null}

                {!user ? (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 mb-2">Sign in to set alerts</h2>
                        <p className="text-neutral-600 mb-6">We'll notify you as soon as jobs matching your criteria are posted.</p>
                    </div>
                ) : loading ? (
                    <div className="text-center py-12 text-neutral-600">Loading your alerts...</div>
                ) : alerts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                        <p className="text-neutral-600 mb-4">You haven't created any alerts yet.</p>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="text-primary font-medium hover:underline"
                            >
                                Create your first alert →
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="bg-white rounded-xl border border-neutral-200 p-6 flex items-start justify-between group"
                            >
                                <div>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {alert.data.conditions.roles?.map((role, i) => (
                                            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold uppercase tracking-wider">
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-neutral-600">
                                            <span className="font-medium text-neutral-900">Locations: </span>
                                            {alert.data.conditions.locations?.join(', ') || 'Any'}
                                        </p>
                                        <p className="text-sm text-neutral-600">
                                            <span className="font-medium text-neutral-900">Min Salary: </span>
                                            {alert.data.conditions.minSalary ? `₹${(alert.data.conditions.minSalary / 100000).toFixed(1)}L+` : 'Not specified'}
                                        </p>
                                        <p className="text-sm text-neutral-600 capitalize">
                                            <span className="font-medium text-neutral-900">Work Type: </span>
                                            {alert.data.conditions.workType?.join(', ') || 'Any'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteAlert(alert.id)}
                                    className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                                    aria-label="Delete alert"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
