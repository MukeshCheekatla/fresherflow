import { WalkinJob } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/shared/utils/cn';

interface WalkinCardProps {
    walkin: WalkinJob;
    walkinId: string;
    onClick?: () => void;
}

export default function WalkinCard({ walkin, walkinId, onClick }: WalkinCardProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const isExpired = () => {
        const lastValid = new Date(walkin.lastValidDay);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return lastValid < today;
    };

    const formatExperience = () => {
        const { min, max } = walkin.experienceRange;
        if (min === 0 && max === 0) return 'Fresher';
        if (min === max) return `${min} year${min !== 1 ? 's' : ''}`;
        return `${min}-${max} years`;
    };

    const handleMapClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const encodedAddress = encodeURIComponent(walkin.exactAddress);
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-6 bg-white rounded-lg border border-neutral-200",
                "transition-all hover:border-neutral-300 hover:shadow-sm",
                isExpired() && "opacity-60",
                onClick && "cursor-pointer"
            )}
        >
            {/* Company and Roles */}
            <div className="mb-3">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    {walkin.company}
                </h3>
                <div className="text-neutral-600">
                    {walkin.roles.join(' • ')}
                </div>
            </div>

            {/* Walk-in Date */}
            <div className="mb-3">
                <div className="text-sm text-neutral-700 mb-1">
                    <span className="font-medium">Walk-in: </span>
                    {formatDate(walkin.walkInDate)}
                </div>
                <div className="text-sm text-neutral-600">
                    {walkin.walkInTimeWindow}
                </div>
            </div>

            {/* Experience */}
            <div className="text-sm text-neutral-600 mb-3">
                {formatExperience()} experience
            </div>

            {/* Address with Map Link */}
            <div className="mb-3">
                <div className="text-sm text-neutral-700 mb-2">
                    {walkin.exactAddress}
                </div>
                <button
                    onClick={handleMapClick}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Open in Google Maps →
                </button>
            </div>

            {/* Footer: Valid Until & Report */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-50">
                <div className="text-xs text-neutral-500">
                    {isExpired() ? (
                        <span className="text-red-600 font-medium uppercase tracking-wider">Expired</span>
                    ) : (
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Valid until {formatDate(walkin.lastValidDay)}
                        </span>
                    )}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `mailto:admin@jobdiscover.com?subject=Report Listing: ${walkin.company} - ${walkin.roles[0]}&body=I would like to report this listing as suspicious or inaccurate.%0D%0A%0D%0AJob ID: ${walkinId}%0D%0ACompany: ${walkin.company}`;
                    }}
                    className="text-xs font-semibold text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                >
                    Report
                </button>
            </div>
        </div>
    );
}
