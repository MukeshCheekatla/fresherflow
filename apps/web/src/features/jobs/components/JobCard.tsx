import { OnlineJob } from '@/types/job';
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
        if (!job.salary) return 'LPA';
        const { min, max } = job.salary;
        if (min && max) {
            return `₹${(min / 100000).toFixed(0)}-${(max / 100000).toFixed(0)}L`;
        }
        return 'LPA';
    };

    const formatExperience = () => {
        const { min, max } = job.experienceRange || { min: 0, max: 0 };
        if (min === 0 && max === 0) return 'Fresher';
        return `${min}-${max}yr`;
    };

    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return;
        if (onToggleSave) onToggleSave();
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative bg-card border border-border rounded-lg p-4 transition-all hover:border-primary/40 hover:shadow-sm flex flex-col gap-3",
                onClick && "cursor-pointer"
            )}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 bg-muted border border-border rounded flex items-center justify-center shrink-0">
                        <BuildingOfficeIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-wider truncate mb-0.5">
                            {job.company}
                        </h4>
                        <h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors leading-tight italic truncate">
                            {job.normalizedRole}
                        </h3>
                    </div>
                </div>

                <button
                    onClick={handleSaveClick}
                    className={cn(
                        "p-1.5 rounded transition-all border shrink-0",
                        isSaved
                            ? "bg-primary/5 border-primary/20 text-primary"
                            : "bg-background border-border text-muted-foreground hover:border-primary/40"
                    )}
                >
                    {isSaved ? <BookmarkSolidIcon className="w-3.5 h-3.5" /> : <BookmarkIcon className="w-3.5 h-3.5" />}
                </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex flex-wrap gap-1.5">
                    {(job.employmentType as string) === 'WALKIN' ? (
                        <span className="px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-600 text-[8px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-orange-600" />
                            Walk-in Drive
                        </span>
                    ) : (job.employmentType as string) === 'INTERNSHIP' ? (
                        <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded">
                            Internship
                        </span>
                    ) : (
                        <span className="px-1.5 py-0.5 bg-primary/5 border border-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded">
                            Full-time Job
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground/50 italic">
                    <div className="w-1 h-1 rounded-full bg-primary/40" />
                    <span>PROTOCOL MATCH</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                <div className="min-w-0">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter mb-0.5">Loc</p>
                    <div className="flex items-center gap-1 truncate text-foreground text-[10px] font-bold">
                        <MapPinIcon className="w-2.5 h-2.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{job.locations[0] || 'Remote'}</span>
                    </div>
                </div>
                <div className="min-w-0">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter mb-0.5">Exp</p>
                    <div className="flex items-center gap-1 truncate text-foreground text-[10px] font-bold">
                        <BriefcaseIcon className="w-2.5 h-2.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{formatExperience()}</span>
                    </div>
                </div>
                <div className="min-w-0">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter mb-0.5">LPA</p>
                    <div className="flex items-center gap-1 truncate text-foreground text-[10px] font-bold">
                        <CurrencyRupeeIcon className="w-2.5 h-2.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{formatSalary()}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest pt-1">
                <div className="flex items-center gap-1 text-success">
                    <div className="w-1 h-1 rounded-full bg-success" />
                    <span>Verified</span>
                </div>
                <div className="flex items-center gap-1 text-primary group-hover:translate-x-0.5 transition-transform">
                    <span>Execute</span>
                    <ChevronRightIcon className="w-3 h-3 stroke-[3]" />
                </div>
            </div>
        </div>
    );
}
