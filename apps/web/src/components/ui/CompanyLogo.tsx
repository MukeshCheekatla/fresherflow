'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

// Helper to extract root domain from URL
const getDomainFromUrl = (url: string): string | null => {
    try {
        const hostname = new URL(url).hostname;
        return hostname;
    } catch {
        return null; // Return null if invalid URL
    }
};

interface CompanyLogoProps {
    companyName: string;
    applyLink?: string;
    className?: string;
}

export default function CompanyLogo({ companyName, applyLink, className }: CompanyLogoProps) {
    const [imgError, setImgError] = useState(false);

    // candidate domains strategy
    // 1. Domain from applyLink (high confidence)
    // 2. Constructed domain from company name (heuristic)

    // Heuristic: "Tech Mahindra" -> "techmahindra.com"
    const constructedDomain = companyName
        ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
        : null;

    const linkDomain = applyLink ? getDomainFromUrl(applyLink) : null;

    // Prioritize link domain, fallback to constructed
    // Note: If linkDomain is something generic like "boards.greenhouse.io", this might fail to get the company logo.
    // Ideally we'd filter out generic job boards, but that's a larger task.
    // For now, let's try linkDomain first, then fallback to constructed.

    // However, we can't easily "try" one URL then another in a single render pass without state.
    // Let's rely on linkDomain if valid, otherwise constructed.
    // If linkDomain fails to load (onError), we could fallback to constructed, but that requires 2-step state.

    // Let's implement a simple 2-stage loading mechanism
    // Stage 0: Try linkDomain
    // Stage 1: Try constructedDomain
    // Stage 2: Fallback to Icon

    const [attemptIndex, setAttemptIndex] = useState(0);

    const candidates = [];
    if (linkDomain) candidates.push(`https://logo.clearbit.com/${linkDomain}`);
    if (constructedDomain) candidates.push(`https://logo.clearbit.com/${constructedDomain}`);

    const currentSrc = candidates[attemptIndex];

    const handleError = () => {
        if (attemptIndex < candidates.length - 1) {
            setAttemptIndex(prev => prev + 1);
        } else {
            setImgError(true);
        }
    };

    if (!currentSrc || imgError) {
        return (
            <div className={cn("w-12 h-12 bg-muted border border-border rounded flex items-center justify-center shrink-0", className)}>
                <BuildingOfficeIcon className="w-6 h-6 text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className={cn("relative w-12 h-12 bg-white border border-border rounded overflow-hidden shrink-0 flex items-center justify-center p-1", className)}>
            <Image
                src={currentSrc}
                alt={`${companyName} logo`}
                width={48}
                height={48}
                className="object-contain w-full h-full"
                onError={handleError}
                unoptimized // Clearbit logos are external and small, optimization is optional but good practice
            />
        </div>
    );
}
