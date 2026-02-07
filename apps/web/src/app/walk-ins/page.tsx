import { Metadata } from 'next';
import CategoryPage from '@/features/jobs/components/CategoryPage';

export const metadata: Metadata = {
    title: 'Walk-in Drives & Campus Hiring | FresherFlow',
    description: 'Discover walk-in interview drives and on-campus recruitment events near you. Get complete venue details, timing, required documents, and eligibility for immediate hiring opportunities.',
    keywords: 'walk-in drives, walk-in interviews, campus placement, fresher walk-ins, direct walk-in jobs, on-campus hiring, immediate hiring',
    openGraph: {
        title: 'Walk-in Drives & Campus Hiring | FresherFlow',
        description: 'Discover walk-in interview drives and on-campus recruitment events across India.',
        type: 'website',
    },
};

export default function WalkInsPage() {
    return <CategoryPage type="WALKIN" />;
}
