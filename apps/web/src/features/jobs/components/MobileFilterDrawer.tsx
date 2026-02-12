'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

import { useState } from 'react';

const LOCATIONS = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Remote'];

interface MobileFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    draftLoc: string | null;
    setDraftLoc: (loc: string | null) => void;
    draftClosingSoon: boolean;
    setDraftClosingSoon: (val: boolean) => void;
    draftShowOnlySaved: boolean;
    setDraftShowOnlySaved: (val: boolean) => void;
    draftMinSalary: number | null;
    setDraftMinSalary: (val: number | null) => void;
    onApply: () => void;
    onClear: () => void;
}

const SALARY_RANGES = [
    { label: 'Any', value: null },
    { label: '3L+', value: 300000 },
    { label: '6L+', value: 600000 },
    { label: '10L+', value: 1000000 },
    { label: '15L+', value: 1500000 },
];

export function MobileFilterDrawer({
    isOpen,
    onClose,
    draftLoc,
    setDraftLoc,
    draftClosingSoon,
    setDraftClosingSoon,
    draftShowOnlySaved,
    setDraftShowOnlySaved,
    draftMinSalary,
    setDraftMinSalary,
    onApply,
    onClear
}: MobileFilterDrawerProps) {
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientY);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStart) return;
        const touchEnd = e.changedTouches[0].clientY;
        const distance = touchEnd - touchStart;
        if (distance > 100) { // Swipe down threshold
            onClose();
        }
        setTouchStart(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
            <div
                className="absolute inset-x-3 top-6 bottom-6 overflow-auto rounded-2xl border border-border bg-card p-4 shadow-2xl"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Visual affordance for swipe */}
                <div className="flex justify-center mb-2">
                    <div className="w-10 h-1 rounded-full bg-border" />
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold tracking-tight text-foreground">Filters</h3>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"
                        aria-label="Close filters"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Location</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {LOCATIONS.map((loc) => (
                                <button
                                    key={`mobile-${loc}`}
                                    onClick={() => setDraftLoc(draftLoc === loc ? null : loc)}
                                    className={cn(
                                        "px-3 py-3 rounded-xl border text-xs font-semibold transition-all uppercase tracking-wide",
                                        draftLoc === loc
                                            ? "bg-primary/20 border-primary text-primary shadow-sm scale-[0.98]"
                                            : "bg-background border-border text-muted-foreground active:bg-muted"
                                    )}
                                >
                                    {loc}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Min. Salary</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {SALARY_RANGES.map((range) => (
                                <button
                                    key={`mobile-sal-${range.label}`}
                                    onClick={() => setDraftMinSalary(range.value)}
                                    className={cn(
                                        "px-3 py-3 rounded-xl border text-xs font-semibold transition-all uppercase tracking-wide",
                                        draftMinSalary === range.value
                                            ? "bg-primary/20 border-primary text-primary shadow-sm scale-[0.98]"
                                            : "bg-background border-border text-muted-foreground active:bg-muted"
                                    )}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Urgency</h4>
                        <button
                            onClick={() => setDraftClosingSoon(!draftClosingSoon)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-3.5 rounded-xl border text-xs font-semibold transition-all uppercase tracking-wide",
                                draftClosingSoon
                                    ? "bg-orange-100 border-orange-300 text-orange-900 dark:bg-amber-500/10 dark:border-amber-500/50 dark:text-amber-300"
                                    : "bg-background border-border text-muted-foreground active:bg-muted"
                            )}
                        >
                            <span>Closing soon</span>
                            {draftClosingSoon && <div className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-amber-500" />}
                        </button>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Saved</h4>
                        <button
                            onClick={() => setDraftShowOnlySaved(!draftShowOnlySaved)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-3.5 rounded-xl border text-xs font-semibold transition-all uppercase tracking-wide",
                                draftShowOnlySaved
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-background border-border text-muted-foreground active:bg-muted"
                            )}
                        >
                            <span>Saved only</span>
                            {draftShowOnlySaved && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </button>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-card pt-4 mt-6 border-t border-border flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest rounded-xl"
                        onClick={onClear}
                    >
                        Clear
                    </Button>
                    <Button
                        className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest rounded-xl"
                        onClick={onApply}
                    >
                        Apply filters
                    </Button>
                </div>
            </div>
        </div>
    );
}
