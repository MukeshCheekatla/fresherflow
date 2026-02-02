import { OnlineJob } from '@/types/job';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
    BookmarkIcon,
    MapPinIcon,
    CurrencyRupeeIcon,
    BriefcaseIcon,
    ClockIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

interface JobCardProps {
    job: OnlineJob;
    jobId: string;
    onClick?: () => void;
    isSaved?: boolean;
    onToggleSave?: () => void;
}

export default function JobCard({ job, jobId, onClick, isSaved = false, onToggleSave }: JobCardProps) {
    const { user } = useAuth();

    const formatSalary = () => {
        if (!job.salary) return 'Not disclosed';
        const { min, max } = job.salary;
        if (min && max) {
            return `₹${(min / 100000).toFixed(1)}L - ${(max / 100000).toFixed(1)}L`;
        }
        return 'Not disclosed';
    };

    const formatExperience = () => {
        const { min, max } = job.experienceRange;
        if (min === 0 && max === 0) return 'Fresher';
        if (min === max) return `${min} year${min !== 1 ? 's' : ''}`;
        return `${min}-${max} yrs`;
    };

    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            alert('Please sign in to save jobs');
            return;
        }
        if (onToggleSave) onToggleSave();
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "job-card group relative animate-in fade-in slide-in-from-bottom-2 duration-500",
                onClick && "cursor-pointer active:scale-[0.98]"
            )}
        >
            {/* Top Row: Role & Save */}
            <div className="flex justify-between items-start gap-4">
                <div className="space-y-1 flex-1">
                    <h2 className="text-foreground group-hover:text-primary transition-colors leading-tight">
                        {job.normalizedRole}
                    </h2>
                    <p className="font-black text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <span className="text-foreground">{job.company}</span>
                        {job.employmentType && (
                            <>
                                <span>•</span>
                                <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full">{job.employmentType}</span>
                            </>
                        )}
                    </p>
                </div>

                <button
                    onClick={handleSaveClick}
                    className={cn(
                        "p-2.5 rounded-xl transition-all duration-300 border",
                        isSaved
                            ? "bg-foreground border-foreground text-background shadow-lg"
                            : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary"
                    )}
                    aria-label={isSaved ? "Remove from wishlist" : "Save for later"}
                >
                    {isSaved ? (
                        <BookmarkSolidIcon className="w-5 h-5" />
                    ) : (
                        <BookmarkIcon className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Middle Row: Meta Info */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 py-1">
                <div className="flex items-center gap-2 text-foreground">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                        <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-bold truncate tracking-tight">{job.locations[0] || 'Remote'}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                        <CurrencyRupeeIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-bold tracking-tight">{formatSalary()}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                        <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-bold tracking-tight">{formatExperience()}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                        <ClockIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-bold tracking-tight">Active Stream</span>
                </div>
            </div>

            {/* Bottom Row: Action */}
            <div className="mt-2 flex items-center justify-between pt-4 border-t border-border">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center overflow-hidden">
                            <div className="w-full h-full bg-muted-foreground/20" />
                        </div>
                    ))}
                    <div className="pl-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center">
                        Verified Stream
                    </div>
                </div>

                <div className="flex items-center gap-1 text-primary font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    View Specs
                    <ChevronRightIcon className="w-3 h-3 stroke-[3]" />
                </div>
            </div>
        </div>
    );
}
