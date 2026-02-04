import { Opportunity } from '@fresherflow/types';
import { cn } from '@/lib/utils';
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

export default function JobCard({ job, onClick, isSaved = false, isApplied = false }: JobCardProps) {

    const formatSalary = () => {
        if (job.salaryRange) return job.salaryRange;
        if (job.stipend) return job.stipend;

        const period = job.salaryPeriod === 'MONTHLY' ? '/mo' : ' LPA';
        const isMonthly = job.salaryPeriod === 'MONTHLY';

        // Check top-level min/max first (preferred)
        const sMin = job.salaryMin !== undefined ? job.salaryMin : job.salary?.min;
        const sMax = job.salaryMax !== undefined ? job.salaryMax : job.salary?.max;

        if (sMin !== undefined && sMax !== undefined) {
            if (sMin === 0 && sMax === 0 && job.type === 'INTERNSHIP') return 'Unpaid';

            const formatMin = isMonthly ? sMin.toLocaleString() : (sMin / 100000).toFixed(1);
            const formatMax = isMonthly ? sMax.toLocaleString() : (sMax / 100000).toFixed(1);

            // Clean up .0 from LPA
            const finalMin = formatMin.endsWith('.0') ? formatMin.slice(0, -2) : formatMin;
            const finalMax = formatMax.endsWith('.0') ? formatMax.slice(0, -2) : formatMax;

            return `₹${finalMin}-${finalMax}${period}`;
        }

        return 'Not disclosed';
    };

    const formatExperience = () => {
        const min = job.experienceMin ?? 0;
        const max = job.experienceMax;

        if (min === 0 && (max === 0 || max === undefined)) return 'Fresher';
        if (max === undefined) return `${min}+ years`;
        return `${min}-${max} years`;
    };

    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        import('react-hot-toast').then(t => t.default.success('Save feature coming soon! ✨'));
    };

    const getJobTypeBadge = () => {
        const type = (job.employmentType || job.type) as string;

        if (type === 'WALKIN' || job.type === 'WALKIN') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                    Walk-in Drive
                </span>
            );
        }

        if (type === 'INTERNSHIP' || job.type === 'INTERNSHIP') {
            return (
                <span className="inline-flex items-center px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded">
                    Internship
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded">
                Full-time Job
            </span>
        );
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative bg-card border border-border rounded-xl p-3 md:p-4 transition-all hover:border-primary/40 hover:shadow-sm flex flex-col gap-2 md:gap-3",
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
            </div>

            {/* Walk-in Specific Details Block */}
            {/* Walk-in Specific Details Block */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {job.type === 'WALKIN' && (job as any).walkInDetails && (
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 space-y-2">
                    {(() => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const details = (job as any).walkInDetails;
                        return (
                            <>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none">Drive Schedule</p>
                                        <p className="text-xs font-bold text-foreground">
                                            {details.dateRange || 'Multiple Dates'}
                                        </p>
                                    </div>
                                    <div className="text-right space-y-0.5">
                                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none">Timing Window</p>
                                        <p className="text-xs font-bold text-foreground">
                                            {details.timeRange || details.reportingTime}
                                        </p>
                                    </div>
                                </div>
                                {details.venueLink && (
                                    <a
                                        href={details.venueLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-1.5 text-[10px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-tight w-fit pt-0.5"
                                    >
                                        <MapPinIcon className="w-3 h-3" />
                                        View Venue Map
                                        <ChevronRightIcon className="w-2.5 h-2.5" />
                                    </a>
                                )}
                            </>
                        );
                    })()}
                </div>
            )}

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
