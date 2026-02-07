import { Opportunity } from '@fresherflow/types';
import { cn } from '@/lib/utils';
import {
    BookmarkIcon,
    MapPinIcon,
    CurrencyRupeeIcon,
    ChevronRightIcon,
    ShieldCheckIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import CompanyLogo from '@/components/ui/CompanyLogo';

/**
 * JobCard - REFINED TYPOGRAPHY PATTERN
 * Adheres to DESIGN_SYSTEM.md with moderated boldness for professional clarity.
 */

interface JobCardProps {
    job: Opportunity;
    jobId: string;
    onClick?: () => void;
    isSaved?: boolean;
    isApplied?: boolean;
    onToggleSave?: () => void;
    isAdmin?: boolean;
}

export default function JobCard({ job, onClick, isSaved = false, isApplied = false, onToggleSave, isAdmin }: JobCardProps) {

    const formatSalary = () => {
        if (job.salaryRange) return job.salaryRange;
        if (job.stipend) return job.stipend;

        const period = job.salaryPeriod === 'MONTHLY' ? '/mo' : ' LPA';
        const isMonthly = job.salaryPeriod === 'MONTHLY';

        const sMin = job.salaryMin !== undefined ? job.salaryMin : job.salary?.min;
        const sMax = job.salaryMax !== undefined ? job.salaryMax : job.salary?.max;

        if (sMin != null && sMax != null) {
            if (sMin === 0 && sMax === 0 && job.type === 'INTERNSHIP') return 'Unpaid';

            const formatMin = isMonthly ? sMin.toLocaleString() : (sMin / 100000).toFixed(1);
            const formatMax = isMonthly ? sMax.toLocaleString() : (sMax / 100000).toFixed(1);

            const finalMin = formatMin.endsWith('.0') ? formatMin.slice(0, -2) : formatMin;
            const finalMax = formatMax.endsWith('.0') ? formatMax.slice(0, -2) : formatMax;

            return `₹${finalMin}-${finalMax}${period}`;
        }

        return 'Not disclosed';
    };



    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onToggleSave) {
            onToggleSave();
        }
    };

    const isClosingSoon = () => {
        if (!job.expiresAt) return false;
        const expiryDate = new Date(job.expiresAt);
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        return expiryDate >= now && expiryDate <= threeDaysFromNow;
    };

    const getJobTypeBadge = () => {
        const type = (job.employmentType || job.type) as string;

        if (type === 'WALKIN' || job.type === 'WALKIN') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                    Drive
                </span>
            );
        }

        if (type === 'INTERNSHIP' || job.type === 'INTERNSHIP') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded">
                    Internship
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded">
                Full-time
            </span>
        );
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative bg-card border border-border rounded-xl p-5 transition-all hover:border-primary/30 hover:shadow-md flex flex-col gap-4",
                onClick && "cursor-pointer"
            )}
        >
            {/* Header: Company + Title + Save */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <CompanyLogo companyName={job.company} applyLink={job.applyLink} />
                    <div className="min-w-0">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] line-clamp-1">
                            {job.company}
                        </h4>
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 mt-1">
                            {job.normalizedRole || job.title}
                        </h3>
                    </div>
                </div>

                <button
                    onClick={handleSaveClick}
                    className={cn(
                        "h-12 w-12 rounded-xl transition-all border shrink-0 flex items-center justify-center",
                        isSaved
                            ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                            : "bg-background border-border text-muted-foreground hover:border-primary/30"
                    )}
                    aria-label={isSaved ? "Remove from saved" : "Save job"}
                >
                    {isSaved ? <BookmarkSolidIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
                </button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
                {getJobTypeBadge()}
                {isClosingSoon() && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded">
                        <ClockIcon className="w-3 h-3" />
                        Expiring Soon
                    </span>
                )}
            </div>

            {/* Walk-in Details */}
            {job.type === 'WALKIN' && job.walkInDetails && (
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-4 space-y-2">
                    {(() => {
                        const details = job.walkInDetails;
                        return (
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-amber-600/80 uppercase tracking-widest">Drive Schedule</p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {details.dateRange || 'Multiple Dates'}
                                    </p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[10px] font-bold text-amber-600/80 uppercase tracking-widest">Window</p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {details.timeRange || details.reportingTime}
                                    </p>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-4 border-t border-border/40">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Location</p>
                    <div className="flex items-center gap-2 text-foreground/90 text-[13px] font-semibold">
                        <MapPinIcon className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />
                        <span className="truncate">{job.locations[0] || 'Remote'}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Salary Estimate</p>
                    <div className="flex items-center gap-2 text-foreground/90 text-[13px] font-semibold">
                        <CurrencyRupeeIcon className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />
                        <span className="truncate">{formatSalary()}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-auto">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-success/80 text-[10px] font-bold uppercase tracking-widest">
                        <ShieldCheckIcon className="w-4 h-4" />
                        <span>Verified</span>
                    </div>
                    {isApplied && (
                        <span className="px-2 py-0.5 bg-success/10 text-success rounded text-[10px] font-bold border border-success/20 uppercase">
                            Tracked
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 text-primary text-[11px] font-bold uppercase tracking-widest group-hover:translate-x-0.5 transition-transform duration-300">
                    <span>{isApplied ? 'Track App' : 'Apply Now'}</span>
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                </div>
            </div>

            {/* Admin Edit Shortcut */}
            {isAdmin && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/admin/opportunities/edit/${job.slug || job.id}`;
                    }}
                    className="absolute -top-2 -right-2 p-2 rounded-full bg-card border border-border shadow-lg text-primary hover:bg-primary/10 transition-colors z-20"
                    title="Edit Listing (Admin)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                </div>
            )}
        </div>
    );
}
