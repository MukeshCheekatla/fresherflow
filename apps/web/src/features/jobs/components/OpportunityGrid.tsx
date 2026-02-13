'use client';

import { Opportunity } from '@fresherflow/types';
import JobCard from './JobCard';
import { SkeletonJobCard } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface OpportunityGridProps {
    opportunities: Opportunity[];
    isLoading: boolean;
    error: string | null;
    isFilterOpen: boolean;
    isAdmin: boolean;
    onToggleSave: (id: string) => void;
    onClearFilters: () => void;
    onRetry: () => void;
    pageSize?: number;
}

export function OpportunityGrid({
    opportunities,
    isLoading,
    error,
    isFilterOpen,
    isAdmin,
    onToggleSave,
    onClearFilters,
    onRetry,
    pageSize = 12
}: OpportunityGridProps) {
    const router = useRouter();
    const [displayCount, setDisplayCount] = useState(pageSize);

    const visibleOpportunities = useMemo(() => {
        return opportunities.slice(0, displayCount);
    }, [opportunities, displayCount]);

    const hasMore = displayCount < opportunities.length;

    const handleLoadMore = () => {
        setDisplayCount(prev => prev + pageSize);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" role="status" aria-label="Loading opportunities">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <SkeletonJobCard key={item} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <ErrorMessage
                title="Feed unavailable"
                message={error}
                onRetry={onRetry}
                variant="card"
            />
        );
    }

    if (opportunities.length === 0) {
        return (
            <ErrorMessage
                title="No results found"
                message="Try adjusting your filters or search keywords to find matching opportunities."
                onRetry={onClearFilters}
                variant="card"
            />
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Listings</h2>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Live updates</span>
                </div>
            </div>
            <div className={cn(
                "grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-6",
                isFilterOpen ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"
            )} role="list" aria-label="Job listings">
                {visibleOpportunities.map((opp) => (
                    <JobCard
                        key={opp.id}
                        job={{
                            ...opp,
                            normalizedRole: opp.title,
                            salary: (opp.salaryMin !== undefined && opp.salaryMax !== undefined) ? { min: opp.salaryMin, max: opp.salaryMax } : undefined,
                        }}
                        jobId={opp.id}
                        isSaved={opp.isSaved || false}
                        isApplied={opp.actions && opp.actions.length > 0}
                        onToggleSave={() => onToggleSave(opp.id)}
                        onClick={() => router.push(`/opportunities/${opp.slug || opp.id}`)}
                        isAdmin={isAdmin}
                    />
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-8">
                    <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        className="h-10 px-8 text-xs font-bold uppercase tracking-widest border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary"
                    >
                        Load more opportunities
                    </Button>
                </div>
            )}
        </div>
    );
}
