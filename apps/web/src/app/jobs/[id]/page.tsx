import OpportunityDetailPage, { generateMetadata as generateOpportunityMetadata } from '../../opportunities/[id]/page';

export const revalidate = 60;

export const generateMetadata = generateOpportunityMetadata;

export default OpportunityDetailPage;
