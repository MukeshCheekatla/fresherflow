import { Opportunity, Profile, OpportunityStatus, EducationLevel } from '@prisma/client';

/**
 * Stage 2: Code-level filtering for fine-grained business logic
 * Assumes opportunities have already been filtered at DB level
 */
export function filterOpportunitiesForUser(
    dbFilteredOpportunities: Opportunity[],
    profile: Profile
): Opportunity[] {
    return dbFilteredOpportunities.filter(opp => {
        // Fine Filter 1: Degree match (exact)
        const degreeMatch = profile.educationLevel &&
            opp.allowedDegrees.includes(profile.educationLevel);

        if (!degreeMatch) return false;

        // Fine Filter 2: Skills overlap (soft match - at least 1 skill matches)
        // This is optional - if required skills is empty, pass through
        if (opp.requiredSkills.length > 0) {
            const hasAnySkill = opp.requiredSkills.some(skill =>
                profile.skills.includes(skill)
            );
            if (!hasAnySkill) return false;
        }

        return true;
    });
}

/**
 * Sort opportunities with walk-ins pinned at top
 */
export function sortOpportunitiesWithWalkinsFirst(opportunities: Opportunity[]): Opportunity[] {
    return [...opportunities].sort((a, b) => {
        // Walk-ins first
        if (a.type === 'WALKIN' && b.type !== 'WALKIN') return -1;
        if (a.type !== 'WALKIN' && b.type === 'WALKIN') return 1;

        // Then by posted date (newest first)
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });
}
