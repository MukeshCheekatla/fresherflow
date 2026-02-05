import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { opportunitiesApi } from '@/lib/api/client';
import OpportunityDetailClient from './OpportunityDetailClient';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ id: string }>;
};

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id: slugOrId } = await params;

    try {
        const { opportunity } = await opportunitiesApi.getById(slugOrId);

        // Format title based on opportunity type
        let title = '';
        if (opportunity.type === 'WALKIN') {
            const date = opportunity.walkInDetails?.dateRange || 'Upcoming';
            title = `Walk-in Interview: ${opportunity.title} at ${opportunity.company} | ${date}`;
        } else if (opportunity.type === 'INTERNSHIP') {
            const location = opportunity.locations[0] || 'Multiple Locations';
            title = `${opportunity.title} Internship at ${opportunity.company} | ${location}`;
        } else {
            const location = opportunity.locations[0] || 'Multiple Locations';
            title = `${opportunity.title} at ${opportunity.company} | ${location}`;
        }

        // Generate description (max 155 chars)
        const eligibility = opportunity.allowedPassoutYears.length > 0
            ? `${opportunity.allowedPassoutYears.join(', ')} graduates`
            : 'freshers';

        const location = opportunity.locations.join(', ') || 'Multiple locations';
        const description = `${opportunity.title} position at ${opportunity.company} in ${location}. Open to ${eligibility}. Apply now on FresherFlow.`.substring(0, 155);

        // Canonical URL
        const url = `https://fresherflow.in/opportunities/${opportunity.slug}`;

        return {
            title: `${title} | FresherFlow`,
            description,
            openGraph: {
                title,
                description,
                url,
                siteName: 'FresherFlow',
                type: 'website',
                images: [
                    {
                        url: 'https://fresherflow.in/og-default.png',
                        width: 1200,
                        height: 630,
                        alt: `${opportunity.title} at ${opportunity.company}`,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: ['https://fresherflow.in/og-default.png'],
            },
            alternates: {
                canonical: url,
            },
        };
    } catch {
        return {
            title: 'Opportunity Not Found | FresherFlow',
            description: 'This opportunity listing is no longer available.',
        };
    }
}

export default async function OpportunityDetailPage({ params }: Props) {
    const { id: slugOrId } = await params;

    try {
        const { opportunity } = await opportunitiesApi.getById(slugOrId);

        // SEO Enforcement: Redirect to slug if ID was used
        if (slugOrId === opportunity.id && opportunity.slug) {
            redirect(`/opportunities/${opportunity.slug}`);
        }
    } catch {
        // Fallback handled by client component (loading/404)
    }

    return <OpportunityDetailClient id={slugOrId} />;
}
