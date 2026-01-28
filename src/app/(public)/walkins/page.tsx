'use client';

import { useState, useEffect } from 'react';
import { useWalkins } from '@/features/walkins/hooks/useWalkins';
import { WalkinJob } from '@/types/walkin';
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
    const { walkins: allWalkins, loading } = useWalkins();
    const [selectedCity, setSelectedCity] = useState('All Cities');

    // Filter and sort client-side
    const today = new Date().toISOString().split('T')[0];
    const walkins = allWalkins.map(w => ({ id: w.id, data: w.data })) // ensure format
        .filter(w => w.data.lastValidDay >= today)
        .filter(w => selectedCity === 'All Cities' || w.data.city === selectedCity)
        .sort((a, b) => a.data.lastValidDay.localeCompare(b.data.lastValidDay));

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
                        <>
                            <p className="text-neutral-600 mb-4">
                                No walk-ins found {selectedCity !== 'All Cities' && `in ${selectedCity}`}
                            </p>
                            <p className="text-sm text-neutral-500">
                                Admin can post walk-ins at <a href="/admin/walkins" className="text-primary hover:underline">/admin/walkins</a>
                            </p>
                        </>
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
