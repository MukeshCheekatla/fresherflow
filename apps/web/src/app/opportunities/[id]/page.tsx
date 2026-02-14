import { Opportunity } from '@fresherflow/types';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { opportunitiesApi } from '@/lib/api/client';
import { Suspense } from 'react';
import OpportunityDetailClient from './OpportunityDetailClient';
import { OpportunityDetailSkeleton } from '@/components/ui/Skeleton';

interface ExtendedOpportunity extends Opportunity {
    updatedAt?: string | Date;
    normalizedRole?: string;
}

// ISR: Revalidate every 60 seconds instead of dynamic for every request
// Jobs don't change every second, so caching drastically improves performance
export const revalidate = 60;

type Props = {
    params: Promise<{ id: string }>;
};

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id: slugOrId } = await params;

    try {
        const { opportunity } = await opportunitiesApi.getById(slugOrId) as { opportunity: ExtendedOpportunity };

        const role = opportunity.normalizedRole || opportunity.title;
        const company = opportunity.company;
        const batch = opportunity.allowedPassoutYears?.length > 0 ? `${opportunity.allowedPassoutYears.join('/')} Batch` : '';
        const location = opportunity.locations?.[0] || 'Remote';
        const type = opportunity.type === 'INTERNSHIP'
            ? 'Internship'
            : opportunity.type === 'WALKIN'
                ? 'Walk-in'
                : 'Job';

        let seoTitle = `${role} at ${company} | ${type}`;
        if (batch) seoTitle += ` | ${batch}`;
        seoTitle += ` | ${location}`;

        const eligibility = opportunity.allowedPassoutYears.length > 0
            ? `${opportunity.allowedPassoutYears.join(', ')} graduates`
            : 'freshers';

        // LinkedIn requires 100+ char description
        const baseDesc = `Verified ${type.toLowerCase()} opportunity at ${company} in ${location}. Open to ${eligibility}.`;
        const applyInfo = opportunity.applyLink ? ' Direct application link available.' : '';
        const freshInfo = ' Browse verified job listings, internships, and walk-ins on FresherFlow.';
        const description = (baseDesc + applyInfo + freshInfo).substring(0, 200);

        // Canonical URL
        const canonicalId = opportunity.slug || opportunity.id;
        const url = `https://fresherflow.in/opportunities/${canonicalId}`;

        // Try dynamic OG image first, fallback to static if Vercel deployment paused
        const ogImageVersion = process.env.NEXT_PUBLIC_OG_IMAGE_VERSION || '1';
        const ogUpdatedAt = opportunity.updatedAt || opportunity.postedAt || '';
        const dynamicOgImageUrl = `https://fresherflow.in/api/og/job/${encodeURIComponent(opportunity.id)}?v=${encodeURIComponent(ogImageVersion)}&t=${encodeURIComponent(String(ogUpdatedAt))}`;

        // Fallback static OG image (works even when Vercel deployment is paused)
        const staticOgImageUrl = 'https://fresherflow.in/main.png';

        // Use dynamic OG image by default
        // Only use static fallback if dynamic generation is unavailable
        const ogImageUrl = dynamicOgImageUrl;

        return {
            title: seoTitle,
            description,
            openGraph: {
                title: seoTitle,
                description,
                url,
                siteName: 'FresherFlow',
                type: 'website',
                images: [
                    {
                        url: ogImageUrl,
                        width: 1200,
                        height: 630,
                        alt: `${opportunity.title} at ${opportunity.company}`,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title: seoTitle,
                description,
                images: [ogImageUrl],
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

const generateJsonLd = (opportunity: Opportunity) => {
    let logoUrl = 'https://fresherflow.in/logo.png';
    try {
        const sourceUrl = opportunity.companyWebsite || opportunity.applyLink;
        if (sourceUrl) {
            const hostname = new URL(sourceUrl).hostname.toLowerCase().replace(/^www\./, '');
            const parts = hostname.split('.').filter(Boolean);
            const domain =
                parts.length > 2
                    ? parts.slice(-2).join('.')
                    : hostname;
            logoUrl = `https://logo.clearbit.com/${domain}`;
        }
    } catch {
        // Fallback to default
    }

    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: opportunity.title,
        description: opportunity.description,
        identifier: {
            '@type': 'PropertyValue',
            name: opportunity.company,
            value: opportunity.id
        },
        datePosted: opportunity.postedAt,
        validThrough: opportunity.expiresAt,
        hiringOrganization: {
            '@type': 'Organization',
            name: opportunity.company,
            logo: logoUrl
        },
        jobLocation: {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressLocality: opportunity.locations?.[0] || 'Remote',
                addressCountry: 'IN'
            }
        },
        employmentType: opportunity.type === 'INTERNSHIP' ? 'INTERN' : 'FULL_TIME',
        directApply: true,
    };

    if (opportunity.salaryMin || (opportunity.salary && opportunity.salary.min)) {
        schema.baseSalary = {
            '@type': 'MonetaryAmount',
            currency: 'INR',
            value: {
                '@type': 'QuantitativeValue',
                minValue: opportunity.salaryMin || opportunity.salary?.min,
                maxValue: opportunity.salaryMax || opportunity.salary?.max,
                unitText: opportunity.salaryPeriod === 'MONTHLY' ? 'MONTH' : 'YEAR'
            }
        };
    }

    return schema;
};

export default async function OpportunityDetailPage({ params }: Props) {
    const { id: slugOrId } = await params;
    let opportunityData = null;

    try {
        const { opportunity } = await opportunitiesApi.getById(slugOrId) as { opportunity: ExtendedOpportunity };
        opportunityData = opportunity;

        // SEO Enforcement: Redirect to slug if ID was used
        if (slugOrId === opportunity.id && opportunity.slug) {
            redirect(`/opportunities/${opportunity.slug}`);
        }
    } catch {
        // Fallback handled by client component (loading/404)
    }

    return (
        <>
            {opportunityData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd(opportunityData)) }}
                />
            )}
            <Suspense fallback={<OpportunityDetailSkeleton />}>
                <OpportunityDetailClient id={slugOrId} initialData={opportunityData} />
            </Suspense>
        </>
    );
}
