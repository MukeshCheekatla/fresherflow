import type { Opportunity, Profile } from '@fresherflow/types';

type MatchResult = {
    score: number;
    reason: string;
};

const normalize = (value: string) => value.trim().toLowerCase();

const toSet = (values: string[]) => new Set(values.map(normalize).filter(Boolean));

export function calculateOpportunityMatch(profile: Profile | null | undefined, opportunity: Opportunity): MatchResult {
    if (!profile) {
        return { score: 0, reason: 'Complete profile for match score' };
    }

    let score = 0;
    let topReason = 'General fit';

    const profileSkills = toSet(profile.skills || []);
    const requiredSkills = toSet(opportunity.requiredSkills || []);
    if (requiredSkills.size > 0 && profileSkills.size > 0) {
        let matchedSkills = 0;
        requiredSkills.forEach((skill) => {
            if (profileSkills.has(skill)) matchedSkills += 1;
        });
        const skillsRatio = matchedSkills / requiredSkills.size;
        score += skillsRatio * 45;
        if (matchedSkills > 0) topReason = `${matchedSkills} matching skills`;
    } else if (requiredSkills.size === 0) {
        score += 20;
    }

    // Eligibility fit (degree/year/experience)
    let eligibilityScore = 0;
    if (opportunity.allowedPassoutYears?.length) {
        const gradYear = profile.gradYear || profile.pgYear;
        if (gradYear && opportunity.allowedPassoutYears.includes(gradYear)) {
            eligibilityScore += 15;
            topReason = topReason === 'General fit' ? 'Eligible batch' : topReason;
        }
    } else {
        eligibilityScore += 7;
    }

    if (opportunity.experienceMax != null) {
        const expectedExperience = 0; // fresher profile baseline until explicit field exists
        if (expectedExperience >= (opportunity.experienceMin || 0) && expectedExperience <= opportunity.experienceMax) {
            eligibilityScore += 15;
        }
    } else {
        eligibilityScore += 8;
    }
    score += Math.min(30, eligibilityScore);

    // Location + work mode fit
    let preferenceScore = 0;
    const preferredCities = toSet(profile.preferredCities || []);
    const jobCities = toSet(opportunity.locations || []);
    let cityMatch = false;
    jobCities.forEach((city) => {
        if (preferredCities.has(city)) cityMatch = true;
    });
    if (cityMatch) preferenceScore += 10;

    if (opportunity.workMode && profile.workModes?.includes(opportunity.workMode)) {
        preferenceScore += 5;
    } else if (!opportunity.workMode) {
        preferenceScore += 2;
    }
    score += Math.min(15, preferenceScore);

    // Urgency bonus
    if (opportunity.expiresAt) {
        const daysLeft = Math.ceil((new Date(opportunity.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        if (daysLeft > 0 && daysLeft <= 2) score += 10;
        else if (daysLeft > 2 && daysLeft <= 7) score += 5;
    }

    return {
        score: Math.max(0, Math.min(100, Math.round(score))),
        reason: topReason,
    };
}
