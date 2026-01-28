'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { WalkinJob } from '@/types';
import TopNav from '@/shared/components/navigation/TopNav';
import WalkinCard from '@/features/walkins/components/WalkinCard';
import { cn } from '@/shared/utils/cn';

const MAJOR_CITIES = [
    'All Cities',
    'Bangalore',
    'Mumbai',
    'Delhi',
    'Hyderabad',
    'Pune',
    'Chennai',
    'Kolkata',
    'Ahmedabad',
];

export default function WalkinsPage() {
    const [walkins, setWalkins] = useState<{ id: string; data: WalkinJob }[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState('All Cities');

    useEffect(() => {
        fetchWalkins();
    }, [selectedCity]);

    const fetchWalkins = async () => {
        if (!db) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];

            // Simplified query to avoid index requirements for MVP
            const q = query(collection(db, 'walkins'));
            const snapshot = await getDocs(q);

            let walkinsData = snapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data() as WalkinJob,
            }));

            // Filter and sort client-side for zero-cost simplicity
            walkinsData = walkinsData
                .filter(w => w.data.lastValidDay >= today)
                .filter(w => selectedCity === 'All Cities' || w.data.city === selectedCity)
                .sort((a, b) => a.data.lastValidDay.localeCompare(b.data.lastValidDay));

            setWalkins(walkinsData);
        } catch (error) {
            console.error('Error fetching walk-ins:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <TopNav />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold text-neutral-900 mb-2">
                        Walk-in Opportunities
                    </h1>
                    <p className="text-neutral-600">
                        Direct hiring events near you
                    </p>
                </div>

                {/* City Filter */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-900 mb-3">
                        Filter by city
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {MAJOR_CITIES.map((city) => (
                            <button
                                key={city}
                                onClick={() => setSelectedCity(city)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                    selectedCity === city
                                        ? "bg-primary text-white"
                                        : "bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-300"
                                )}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-neutral-900">
                        {walkins.length} walk-in{walkins.length !== 1 ? 's' : ''} found
                        {selectedCity !== 'All Cities' && ` in ${selectedCity}`}
                    </h2>
                </div>

                {/* Walk-ins List */}
                {loading ? (
                    <div className="text-center py-12 text-neutral-600">
                        Loading walk-ins...
                    </div>
                ) : walkins.length === 0 ? (
                    <div className="text-center py-12">
                        {!db ? (
                            <>
                                <p className="text-neutral-600 mb-4">⚠️ Firebase Not Configured</p>
                                <p className="text-sm text-neutral-500 mb-2">
                                    Please set up your Firebase project and add credentials to <code className="bg-neutral-100 px-2 py-1 rounded">.env.local</code>
                                </p>
                                <p className="text-sm text-neutral-500">
                                    See <a href="https://github.com" className="text-primary hover:underline">README.md</a> for setup instructions
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-neutral-600 mb-4">
                                    No walk-ins found {selectedCity !== 'All Cities' && `in ${selectedCity}`}
                                </p>
                                <p className="text-sm text-neutral-500">
                                    Admin can post walk-ins at <a href="/admin" className="text-primary hover:underline">/admin</a>
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {walkins.map((walkin) => (
                            <WalkinCard
                                key={walkin.id}
                                walkin={walkin.data}
                                walkinId={walkin.id}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
