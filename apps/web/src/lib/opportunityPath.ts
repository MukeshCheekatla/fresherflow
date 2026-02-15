type OpportunityType = string | undefined;

export function getOpportunityPath(type: OpportunityType, slugOrId: string): string {
    if (type === 'JOB') return `/jobs/${slugOrId}`;
    if (type === 'INTERNSHIP') return `/internships/${slugOrId}`;
    if (type === 'WALKIN') return `/walk-ins/details/${slugOrId}`;
    return `/opportunities/${slugOrId}`;
}

export function getOpportunityPathFromItem(item: { type?: string; slug?: string | null; id: string }): string {
    return getOpportunityPath(item.type, item.slug || item.id);
}
