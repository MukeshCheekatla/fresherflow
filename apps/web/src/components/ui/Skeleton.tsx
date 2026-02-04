'use client';

import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded bg-muted", className)}
            {...props}
        />
    );
}

export function SkeletonJobCard() {
    return (
        <div className="bg-card rounded-lg border border-border p-4 space-y-3">
            {/* Header Mirror */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 flex-1">
                    <Skeleton className="h-10 w-10 rounded shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
                <Skeleton className="h-10 w-10 rounded shrink-0" />
            </div>

            {/* Badge Row Mirror */}
            <div className="flex justify-between items-center pt-1">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
            </div>

            {/* Grid Mirror */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>

            {/* Footer Mirror */}
            <div className="pt-2 border-t border-border/30 flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    );
}

// Admin skeleton components (merged from shared)
export function CardSkeleton() {
    return (
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-8 w-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <tr className="border-b border-border">
            <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
            <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
            <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
        </tr>
    );
}

export function StatsSkeleton() {
    return (
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-12" />
        </div>
    );
}

