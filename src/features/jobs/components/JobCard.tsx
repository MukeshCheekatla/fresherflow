import { OnlineJob } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { useAuth } from '@/context/AuthContext';

interface JobCardProps {
    job: OnlineJob;
    jobId: string;
    onClick?: () => void;
}

export default function JobCard({ job, jobId, onClick }: JobCardProps) {
    const { profile, toggleSaveJob, user, isAdmin } = useAuth();

    const isSaved = profile?.savedJobs.includes(jobId);

    const formatSalary = () => {
        if (!job.salary) return 'Not disclosed';
        const { min, max, currency } = job.salary;
        if (min && max) {
            return `₹${(min / 100000).toFixed(1)}L - ${(max / 100000).toFixed(1)}L`;
        }
        return 'Not disclosed';
    };

    const formatExperience = () => {
        const { min, max } = job.experienceRange;
        if (min === 0 && max === 0) return 'Fresher';
        if (min === max) return `${min} year${min !== 1 ? 's' : ''}`;
        return `${min}-${max} years`;
    };

    const getMatchReason = () => {
        if (job.mustHaveSkills.length > 0) {
            return `Matches your ${job.mustHaveSkills[0]} skills`;
        }
        return 'Recommended for you';
    };

    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            // Trigger auth dialog from parent or via context if possible
            // For now, assume TopNav handles auth triggers, but we can call toggle
            // which will just do nothing if no user.
            alert('Please sign in to save jobs');
            return;
        }
        toggleSaveJob(jobId);
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-6 bg-white rounded-lg border border-neutral-200 relative group",
                "transition-all hover:border-neutral-300 hover:shadow-sm",
                onClick && "cursor-pointer"
            )}
        >
            {/* Save Button */}
            <button
                onClick={handleSaveClick}
                className={cn(
                    "absolute top-4 right-4 p-2 rounded-full transition-colors",
                    isSaved
                        ? "text-primary bg-primary/5"
                        : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
                )}
                aria-label={isSaved ? "Unsave job" : "Save job"}
            >
                <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            </button>

            {/* Role and Company */}
            <div className="mb-3 pr-8">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    {job.normalizedRole}
                </h3>
                <div className="flex items-center gap-2 text-neutral-600">
                    <span className="font-medium">{job.company}</span>
                    <span>•</span>
                    <span className="truncate">{job.locations.join(', ')}</span>
                </div>
            </div>

            {/* Experience and Salary */}
            <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                <span>{formatExperience()}</span>
                <span>•</span>
                <span className="font-medium">{formatSalary()}</span>
            </div>

            {/* Match Reason */}
            <div className="text-sm text-primary mb-4 font-medium">
                {getMatchReason()}
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-3">
                    <div className="text-xs text-neutral-500">
                        {job.source}
                    </div>
                    {/* Admin Controls */}
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle edit
                                    console.log('Edit job', jobId);
                                }}
                                className="text-xs font-semibold text-neutral-600 hover:text-primary transition-colors"
                            >
                                Edit
                            </button>
                            <span className="text-neutral-300">|</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle delete
                                    console.log('Delete job', jobId);
                                }}
                                className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                <a
                    href={job.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-sm border border-neutral-800"
                >
                    Apply Now
                </a>
            </div>
        </div>
    );
}
