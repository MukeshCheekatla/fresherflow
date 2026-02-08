import { Opportunity } from '@fresherflow/types';
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

        // Format title strictly per SEO Strategy: Role + "Fresher Job" + Company + Batch + Location
        const role = opportunity.normalizedRole || opportunity.title;
        const company = opportunity.company;
        const batch = opportunity.allowedPassoutYears?.length > 0 ? `${opportunity.allowedPassoutYears.join('/')} Batch` : '';
        const location = opportunity.locations?.[0] || 'Remote';
        const type = opportunity.type === 'INTERNSHIP' ? 'Internship' : 'Fresher Job';

        let seoTitle = `${role} ${type} at ${company}`;
        if (batch) seoTitle += ` ${batch}`;
        seoTitle += ` - ${location}`;

        // Generate description (max 155 chars)
        const eligibility = opportunity.allowedPassoutYears.length > 0
            ? `${opportunity.allowedPassoutYears.join(', ')} graduates`
            : 'freshers';

        const description = `${opportunity.title} position at ${opportunity.company} in ${location}. Open to ${eligibility}. Apply now on FresherFlow.`.substring(0, 155);

        // Canonical URL
        const canonicalId = opportunity.slug || opportunity.id;
        const url = `https://fresherflow.in/opportunities/${canonicalId}`;
        const ogImageVersion = process.env.NEXT_PUBLIC_OG_IMAGE_VERSION || '1';
        const ogUpdatedAt = opportunity.updatedAt || opportunity.postedAt || '';
        const ogImageUrl = `https://fresherflow.in/api/og/job/${encodeURIComponent(opportunity.id)}?v=${encodeURIComponent(ogImageVersion)}&t=${encodeURIComponent(String(ogUpdatedAt))}`;

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
        const { opportunity } = await opportunitiesApi.getById(slugOrId);
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
            <OpportunityDetailClient id={slugOrId} initialData={opportunityData} />
        </>
    );
}
