import { Opportunity } from '@fresherflow/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
    BookmarkIcon,
    MapPinIcon,
    CurrencyRupeeIcon,
    BriefcaseIcon,
    ChevronRightIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

/**
 * JobCard - CANONICAL REFERENCE PATTERN
 * 
 * This is the gold standard for feature components.
 * Rules demonstrated here:
 * 
 * 1. NO arbitrary Tailwind values (text-[9px], h-[35px], etc.)
 * 2. Typography: text-xs (12px) minimum, text-sm (14px) for body, text-base (16px) for titles
 * 3. Spacing: 8pt grid only (0.5rem, 1rem, 1.5rem, 2rem, etc.)
 * 4. Touch targets: min 48px for interactive elements
 * 5. Use semantic color tokens (primary, muted-foreground, etc.)
 * 
 * DO NOT deviate from this pattern in other components.
 */

interface JobCardProps {
    job: Opportunity;
    jobId: string;
    onClick?: () => void;
    isSaved?: boolean;
    isApplied?: boolean;
    onToggleSave?: () => void;
}

export default function JobCard({ job, jobId, onClick, isSaved = false, isApplied = false, onToggleSave }: JobCardProps) {
    const { user } = useAuth();

    const formatSalary = () => {
        if (job.salaryRange) return job.salaryRange;
        if (job.stipend) return job.stipend;

        if (!job.salary) return 'Not disclosed';
        const { min, max } = job.salary;

        if (min === 0 && max === 0 && job.type === 'INTERNSHIP') return 'Unpaid';
        if (min && max) {
            return `₹${(min / 100000).toFixed(0)}-${(max / 100000).toFixed(0)}L`;
        }
        return 'Not disclosed';
    };

    const formatExperience = () => {
        const { min, max } = job.experienceRange || { min: 0, max: 0 };
        if (min === 0 && max === 0) return 'Fresher';
        return `${min}-${max} years`;
    };

    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return;
        if (onToggleSave) onToggleSave();
    };

    const getJobTypeBadge = () => {
        const type = job.employmentType as string;

        if (type === 'WALKIN') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-bold uppercase tracking-wider rounded">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                    Walk-in
                </span>
            );
        }

        if (type === 'INTERNSHIP') {
            return (
                <span className="inline-flex items-center px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs font-bold uppercase tracking-wider rounded">
                    Internship
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2 py-1 bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded">
                Full-time
            </span>
        );
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative bg-card border border-border rounded-lg p-4 transition-all hover:border-primary/40 hover:shadow-sm flex flex-col gap-3",
                onClick && "cursor-pointer"
            )}
        >
            {/* Header: Company + Title + Save Button */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-muted border border-border rounded flex items-center justify-center shrink-0">
                        <BuildingOfficeIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                        {/* Company name - text-xs minimum (12px) */}
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide truncate">
                            {job.company}
                        </h4>
                        {/* Job title - text-sm for body (14px) */}
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight truncate mt-0.5">
                            {job.normalizedRole}
                        </h3>
                    </div>
                </div>

                {/* Save button - 48px minimum (h-12) */}
                <button
                    onClick={handleSaveClick}
                    className={cn(
                        "p-2 rounded transition-all border shrink-0 min-w-[2.5rem] min-h-[2.5rem]",
                        isSaved
                            ? "bg-primary/5 border-primary/20 text-primary"
                            : "bg-background border-border text-muted-foreground hover:border-primary/40"
                    )}
                    aria-label={isSaved ? "Remove from saved" : "Save job"}
                >
                    {isSaved ? <BookmarkSolidIcon className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
                </button>
            </div>

            {/* Job Type Badge + Match Status */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                    {getJobTypeBadge()}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    <span>VERIFIED</span>
                </div>
            </div>

            {/* Job Details Grid */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
                {/* Location */}
                <div className="min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Location</p>
                    <div className="flex items-center gap-1 truncate text-foreground text-sm font-semibold">
                        <MapPinIcon className="w-3 h-3 shrink-0 text-muted-foreground" />
                        <span className="truncate">{job.locations[0] || 'Remote'}</span>
                    </div>
                </div>

                {/* Experience */}
                <div className="min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Experience</p>
                    <div className="flex items-center gap-1 truncate text-foreground text-sm font-semibold">
                        <BriefcaseIcon className="w-3 h-3 shrink-0 text-muted-foreground" />
                        <span className="truncate">{formatExperience()}</span>
                    </div>
                </div>

                {/* Salary */}
                <div className="min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Salary</p>
                    <div className="flex items-center gap-1 truncate text-foreground text-sm font-semibold">
                        <CurrencyRupeeIcon className="w-3 h-3 shrink-0 text-muted-foreground" />
                        <span className="truncate">{formatSalary()}</span>
                    </div>
                </div>
            </div>

            {/* Footer: Status + Action */}
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide pt-2 border-t border-border/30">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-success">
                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                        <span>Verified</span>
                    </div>
                    {isApplied && (
                        <span className="px-1.5 py-0.5 bg-success/10 text-success rounded text-[10px] border border-success/20">
                            Applied
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 text-primary group-hover:translate-x-0.5 transition-transform">
                    <span>{isApplied ? 'Update status' : 'View Details'}</span>
                    <ChevronRightIcon className="w-3.5 h-3.5 stroke-2" />
                </div>
            </div>
        </div>
    );
}
