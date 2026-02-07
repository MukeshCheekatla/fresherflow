import { useState } from 'react';
import Image from 'next/image';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

// Helper to extract root domain from URL
const getDomainFromUrl = (url: string): string | null => {
    try {
        const hostname = new URL(url).hostname;
        const parts = hostname.split('.');
        if (parts.length >= 2) {
            // Handle common subdomains like careers.google.com -> google.com
            // This is a simple heuristic, might need refinement for complex TLDs like co.uk
            return parts.slice(-2).join('.');
        }
        return hostname;
    } catch (e) {
        return null;
    }
};

interface CompanyLogoProps {
    companyName: string;
    applyLink?: string;
    className?: string;
}

export default function CompanyLogo({ companyName, applyLink, className }: CompanyLogoProps) {
    const [imgError, setImgError] = useState(false);

    // Try to get domain from applyLink
    const domain = applyLink ? getDomainFromUrl(applyLink) : null;
    const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : null;

    if (!logoUrl || imgError) {
        return (
            <div className={cn("w-12 h-12 bg-muted border border-border rounded flex items-center justify-center shrink-0", className)}>
                <BuildingOfficeIcon className="w-6 h-6 text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className={cn("relative w-12 h-12 bg-white border border-border rounded overflow-hidden shrink-0 flex items-center justify-center p-1", className)}>
            <Image
                src={logoUrl}
                alt={`${companyName} logo`}
                width={48}
                height={48}
                className="object-contain w-full h-full"
                onError={() => setImgError(true)}
                unoptimized // Clearbit logos are external and small, optimization is optional but good practice
            />
        </div>
    );
}
