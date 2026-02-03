import { EducationLevel, WorkMode, Availability, OpportunityType } from '@prisma/client';
import Fuse from 'fuse.js';

/**
 * Centralized Eligibility Matching Engine
 * 
 * This service contains ALL eligibility logic for the platform.
 * Never scatter eligibility checks across routes or controllers.
 */

interface UserProfile {
    educationLevel: EducationLevel | null;
    passoutYear: number | null;
    interestedIn: OpportunityType[];
    preferredCities: string[];
    workModes: WorkMode[];
    availability: Availability | null;
    skills: string[];
}

interface OpportunityRequirements {
    type: OpportunityType;
    allowedDegrees: EducationLevel[];
    allowedCourses: string[];
    allowedPassoutYears: number[];
    allowedAvailability: Availability[];
    requiredSkills: string[];
    locations: string[];
    workMode: WorkMode | null;
}

export class EligibilityService {
    /**
     * Main eligibility check - must pass ALL criteria
     */
    static checkEligibility(
        profile: UserProfile,
        opportunity: OpportunityRequirements
    ): { eligible: boolean; reasons: string[] } {
        const reasons: string[] = [];

        // 1. Opportunity Type Match
        if (!this.matchOpportunityType(profile.interestedIn, opportunity.type)) {
            reasons.push('Not interested in this opportunity type');
        }

        // 2. Degree Match
        if (!this.matchDegree(profile.educationLevel, opportunity.allowedDegrees)) {
            reasons.push('Education level does not match requirements');
        }

        // 3. Passout Year Match
        if (!this.matchPassoutYear(profile.passoutYear, opportunity.allowedPassoutYears)) {
            reasons.push('Passout year does not match requirements');
        }

        // 4. Location Match
        if (!this.matchLocation(profile.preferredCities, opportunity.locations)) {
            reasons.push('Location preference does not match');
        }

        // 5. Work Mode Match
        if (!this.matchWorkMode(profile.workModes, opportunity.workMode)) {
            reasons.push('Work mode preference does not match');
        }

        // 6. Availability Match
        if (!this.matchAvailability(profile.availability, opportunity.allowedAvailability)) {
            reasons.push('Availability does not match requirements');
        }

        return {
            eligible: reasons.length === 0,
            reasons,
        };
    }

    /**
     * Check if user is interested in this opportunity type
     */
    static matchOpportunityType(
        userInterests: OpportunityType[],
        oppType: OpportunityType
    ): boolean {
        if (userInterests.length === 0) return true; // No preference = match all
        return userInterests.includes(oppType);
    }

    /**
     * Check if user's degree matches allowed degrees
     */
    static matchDegree(
        userDegree: EducationLevel | null,
        allowedDegrees: EducationLevel[]
    ): boolean {
        if (!userDegree) return false; // Must have education level
        if (allowedDegrees.length === 0) return true; // No restriction = match all
        return allowedDegrees.includes(userDegree);
    }

    /**
     * Check if user's passout year matches requirements
     */
    static matchPassoutYear(
        userYear: number | null,
        allowedYears: number[]
    ): boolean {
        if (!userYear) return false; // Must have passout year
        if (allowedYears.length === 0) return true; // No restriction = match all
        return allowedYears.includes(userYear);
    }

    /**
     * Check if user's preferred cities overlap with opportunity locations
     */
    static matchLocation(
        userCities: string[],
        oppLocations: string[]
    ): boolean {
        if (userCities.length === 0) return true; // No preference = match all
        if (oppLocations.length === 0) return true; // No restriction = match all

        // Case-insensitive match
        const normalizedUserCities = userCities.map((c) => c.toLowerCase().trim());
        const normalizedOppLocations = oppLocations.map((c) => c.toLowerCase().trim());

        return normalizedUserCities.some((city) => normalizedOppLocations.includes(city));
    }

    /**
     * Check if user's work mode preferences match opportunity work mode
     */
    static matchWorkMode(
        userModes: WorkMode[],
        oppMode: WorkMode | null
    ): boolean {
        if (userModes.length === 0) return true; // No preference = match all
        if (!oppMode) return true; // No restriction = match all
        return userModes.includes(oppMode);
    }

    /**
     * Check if user's availability matches requirements
     */
    static matchAvailability(
        userAvailability: Availability | null,
        allowedAvailability: Availability[]
    ): boolean {
        if (!userAvailability) return false; // Must have availability set
        if (allowedAvailability.length === 0) return true; // No restriction = match all
        return allowedAvailability.includes(userAvailability);
    }

    /**
     * Get matching score (0-100) for ranking purposes
     * Not used for filtering, only for sorting eligible opportunities
     */
    static getMatchScore(
        profile: UserProfile,
        opportunity: OpportunityRequirements
    ): number {
        let score = 0;
        let maxScore = 0;

        // Opportunity type match (20 points)
        maxScore += 20;
        if (this.matchOpportunityType(profile.interestedIn, opportunity.type)) {
            score += 20;
        }

        // Location match (30 points)
        maxScore += 30;
        if (this.matchLocation(profile.preferredCities, opportunity.locations)) {
            score += 30;
        }

        // Work mode match (20 points)
        maxScore += 20;
        if (this.matchWorkMode(profile.workModes, opportunity.workMode)) {
            score += 20;
        }

        // Skills match (30 points)
        maxScore += 30;
        if (opportunity.requiredSkills.length > 0) {
            const fuse = new Fuse(profile.skills, {
                threshold: 0.3, // Allow moderate typos/variations
                distance: 100,
            });

            const matchingSkills = opportunity.requiredSkills.filter((skill) => {
                const results = fuse.search(skill);
                return results.length > 0;
            });

            const skillMatchRatio = matchingSkills.length / opportunity.requiredSkills.length;
            score += skillMatchRatio * 30;
        } else {
            score += 30; // No skills required = full score
        }

        return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    }
}

