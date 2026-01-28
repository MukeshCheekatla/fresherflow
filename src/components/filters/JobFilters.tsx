'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface JobFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    initialFilters?: FilterState;
}

export interface FilterState {
    experience: number;
    workTypes: string[];
    locations: string[];
}

const WORK_TYPES = [
    { id: 'remote', label: 'Remote' },
    { id: 'hybrid', label: 'Hybrid' },
    { id: 'onsite', label: 'On-site' },
];

const COMMON_LOCATIONS = [
    'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'
];

export default function JobFilters({ onFilterChange, initialFilters }: JobFiltersProps) {
    const [filters, setFilters] = useState<FilterState>(initialFilters || {
        experience: 0,
        workTypes: [],
        locations: [],
    });

    const updateFilters = (newFilters: Partial<FilterState>) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        onFilterChange(updated);
    };

    const toggleWorkType = (id: string) => {
        const updated = filters.workTypes.includes(id)
            ? filters.workTypes.filter(t => t !== id)
            : [...filters.workTypes, id];
        updateFilters({ workTypes: updated });
    };

    const toggleLocation = (loc: string) => {
        const updated = filters.locations.includes(loc)
            ? filters.locations.filter(l => l !== loc)
            : [...filters.locations, loc];
        updateFilters({ locations: updated });
    };

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-8 mb-8 sticky top-20">
            {/* Experience Filter */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                        Experience (Max {filters.experience} years)
                    </label>
                    <span className="text-xs font-mono bg-neutral-100 px-2 py-1 rounded">
                        {filters.experience === 0 ? 'Any' : `${filters.experience}y`}
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={filters.experience}
                    onChange={(e) => updateFilters({ experience: parseInt(e.target.value) })}
                    className="w-full h-2 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between mt-2 text-[10px] text-neutral-400 font-medium">
                    <span>0y</span>
                    <span>5y</span>
                    <span>10y</span>
                    <span>15y+</span>
                </div>
            </div>

            {/* Work Type Filter */}
            <div>
                <label className="block text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
                    Work Type
                </label>
                <div className="flex flex-wrap gap-2">
                    {WORK_TYPES.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => toggleWorkType(type.id)}
                            className={cn(
                                "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                                filters.workTypes.includes(type.id)
                                    ? "bg-neutral-900 border-neutral-900 text-white shadow-sm"
                                    : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
                            )}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Location Filter */}
            <div>
                <label className="block text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
                    Popular Locations
                </label>
                <div className="flex flex-wrap gap-2">
                    {COMMON_LOCATIONS.map((loc) => (
                        <button
                            key={loc}
                            onClick={() => toggleLocation(loc)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                                filters.locations.includes(loc)
                                    ? "bg-primary/5 border-primary/20 text-primary"
                                    : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
                            )}
                        >
                            {loc}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={() => updateFilters({ experience: 0, workTypes: [], locations: [] })}
                className="w-full py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-900 transition-colors"
            >
                Clear all filters
            </button>
        </div>
    );
}
