// Eligibility Rules - Deterministic & Explainable
// Every rule must have a clear reason

import { Opportunity, Profile, EducationLevel } from '@job-platform/types';

export interface EligibilityRule {
    name: string;
    check: (opportunity: Opportunity, profile: Profile) => boolean;
    getReason: (opportunity: Opportunity, profile: Profile) => string;
}

/**
 * Degree Eligibility Rule
 * User's education level must be in allowed degrees
 */
export const degreeRule: EligibilityRule = {
    name: 'DEGREE_MATCH',
    check: (opp, profile) => {
        if (!profile.educationLevel) return false;
        return opp.allowedDegrees.includes(profile.educationLevel);
    },
    getReason: (opp, profile) => {
        return `Your education level (${profile.educationLevel}) is not in the allowed degrees: ${opp.allowedDegrees.join(', ')}`;
    }
};

/**
 * Passout Year Eligibility Rule
 * User's passout year must be in allowed years
 */
export const passoutYearRule: EligibilityRule = {
    name: 'PASSOUT_YEAR_MATCH',
    check: (opp, profile) => {
        if (!profile.passoutYear) return false;
        return opp.allowedPassoutYears.includes(profile.passoutYear);
    },
    getReason: (opp, profile) => {
        return `Your passout year (${profile.passoutYear}) is not in the allowed years: ${opp.allowedPassoutYears.join(', ')}`;
    }
};

/**
 * Skills Eligibility Rule
 * If opportunity has required skills, user must have at least one
 */
export const skillsRule: EligibilityRule = {
    name: 'SKILLS_MATCH',
    check: (opp, profile) => {
        if (!opp.requiredSkills || opp.requiredSkills.length === 0) {
            return true; // No skills required
        }

        const userSkills = profile.skills?.map(s => s.toLowerCase()) || [];
        const requiredSkills = opp.requiredSkills.map(s => s.toLowerCase());

        return requiredSkills.some(req => userSkills.includes(req));
    },
    getReason: (opp, profile) => {
        return `You need at least one of these skills: ${opp.requiredSkills.join(', ')}. Your skills: ${profile.skills?.join(', ') || 'None'}`;
    }
};

/**
 * Location Preference Rule
 * Opportunity location should be in user's preferred cities
 */
export const locationRule: EligibilityRule = {
    name: 'LOCATION_MATCH',
    check: (opp, profile) => {
        if (!profile.preferredCities || profile.preferredCities.length === 0) {
            return true; // No preference set
        }

        const userCities = profile.preferredCities.map(c => c.toLowerCase());
        const oppLocations = opp.locations.map(l => l.toLowerCase());

        return oppLocations.some(loc => userCities.includes(loc));
    },
    getReason: (opp, profile) => {
        return `Opportunity locations (${opp.locations.join(', ')}) don't match your preferred cities: ${profile.preferredCities?.join(', ') || 'None'}`;
    }
};

/**
 * Work Mode Preference Rule (Soft Rule - Warning Only)
 * Opportunity work mode should match user's preferred work modes
 */
export const workModeRule: EligibilityRule = {
    name: 'WORK_MODE_MATCH',
    check: (opp, profile) => {
        if (!opp.workMode || !profile.preferredWorkModes || profile.preferredWorkModes.length === 0) {
            return true; // No restriction
        }

        return profile.preferredWorkModes.includes(opp.workMode);
    },
    getReason: (opp, profile) => {
        return `Work mode (${opp.workMode}) doesn't match your preferences: ${profile.preferredWorkModes?.join(', ') || 'None'}`;
    }
};

/**
 * All Hard Rules (Must Pass)
 * These are non-negotiable eligibility criteria
 */
export const HARD_RULES: EligibilityRule[] = [
    degreeRule,
    passoutYearRule,
    skillsRule,
];

/**
 * All Soft Rules (Warnings)
 * These are preferences but not blockers
 */
export const SOFT_RULES: EligibilityRule[] = [
    locationRule,
    workModeRule,
];

/**
 * All Rules Combined
 */
export const ALL_RULES: EligibilityRule[] = [
    ...HARD_RULES,
    ...SOFT_RULES,
];
