import { Metadata } from 'next';
import CategoryPage from '@/features/jobs/components/CategoryPage';
import { OpportunityType } from '@fresherflow/types';

export const metadata: Metadata = {
    title: 'Internships for Students | FresherFlow',
    description: 'Find internship opportunities for students and recent graduates. Explore verified internship openings with stipends, skill development programs, and career kickstart opportunities.',
    keywords: 'internships for students, paid internships, summer internships, fresher internships, internship opportunities india, student internships',
    openGraph: {
        title: 'Internships for Students | FresherFlow',
        description: 'Find internship opportunities for students and recent graduates across India.',
        type: 'website',
    },
};

export default function InternshipsPage() {
    return <CategoryPage type={OpportunityType.INTERNSHIP} />;
}
