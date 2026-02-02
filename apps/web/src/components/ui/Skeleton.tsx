import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-slate-200", className)}
            {...props}
        />
    );
}

export function SkeletonJobCard() {
    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 space-y-6">
            <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                    <div className="flex gap-2">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
            <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    );
}
