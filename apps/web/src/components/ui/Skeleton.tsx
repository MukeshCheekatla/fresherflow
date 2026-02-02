import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

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
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                    <div className="flex gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
            </div>
            <div className="pt-6 border-t border-border/50 flex justify-between items-center">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    );
}
