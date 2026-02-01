'use client';

import { cn } from '@/shared/utils/cn';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div className={cn("animate-pulse bg-neutral-200 rounded-lg", className)} />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
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
        <tr className="border-b border-neutral-100">
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
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-12" />
        </div>
    );
}
