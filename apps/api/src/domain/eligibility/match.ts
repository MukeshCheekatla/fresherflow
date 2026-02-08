// Eligibility Matching Engine
// Deterministic, explainable, logged

import { Opportunity, Profile } from '@fresherflow/types';
import { HARD_RULES, SOFT_RULES, EligibilityRule } from './rules';
import logger from '../../utils/logger';

export interface EligibilityResult {
    eligible: boolean;
    reason?: string;
    warnings?: string[];
    matchedRules: string[];
    failedRules: string[];
}

/**
 * Check if user is eligible for an opportunity
 * Deterministic - same input always produces same output
 * Explainable - returns specific reason for ineligibility
 * Logged - all checks are logged for audit
 */
export function checkEligibility(
    opportunity: Opportunity,
    profile: Profile,
    userId?: string
): EligibilityResult {
    const matchedRules: string[] = [];
    const failedRules: string[] = [];
    const warnings: string[] = [];
    let eligible = true;
    let reason: string | undefined;

    // Check all hard rules
    for (const rule of HARD_RULES) {
        const passed = rule.check(opportunity, profile);

        if (passed) {
            matchedRules.push(rule.name);
        } else {
            failedRules.push(rule.name);
            eligible = false;
            reason = rule.getReason(opportunity, profile);

            // Log ineligibility
            logger.info('Eligibility check failed', {
                userId,
                opportunityId: opportunity.id,
                rule: rule.name,
                reason
            });

            break; // Stop at first hard rule failure
        }
    }

    // Check soft rules (only if hard rules passed)
    if (eligible) {
        for (const rule of SOFT_RULES) {
            const passed = rule.check(opportunity, profile);

            if (passed) {
                matchedRules.push(rule.name);
            } else {
                const warning = rule.getReason(opportunity, profile);
                warnings.push(warning);

                // Log warning
                logger.debug('Soft rule warning', {
                    userId,
                    opportunityId: opportunity.id,
                    rule: rule.name,
                    warning
                });
            }
        }
    }

    // Log successful match
    if (eligible) {
        logger.debug('Eligibility check passed', {
            userId,
            opportunityId: opportunity.id,
            matchedRules,
            warnings: warnings.length
        });
    }

    return {
        eligible,
        reason,
        warnings: warnings.length > 0 ? warnings : undefined,
        matchedRules,
        failedRules
    };
}

/**
 * Filter opportunities for a user
 * Returns only eligible opportunities with eligibility metadata
 */
export function filterOpportunitiesForUserWithReasons(
    opportunities: Opportunity[],
    profile: Profile,
    userId?: string
): Array<Opportunity & { eligibility: EligibilityResult }> {
    return opportunities
        .map(opp => ({
            ...opp,
            eligibility: checkEligibility(opp, profile, userId)
        }))
        .filter(opp => opp.eligibility.eligible);
}

/**
 * Legacy compatibility - returns just opportunities
 */
export function filterOpportunitiesForUser(
    opportunities: Opportunity[],
    profile: Profile
): Opportunity[] {
    return opportunities.filter(opp =>
        checkEligibility(opp, profile).eligible
    );
}

/**
 * Sort opportunities with walk-ins pinned at top
 */
export function sortOpportunitiesWithWalkinsFirst<T extends { type: string; postedAt: Date | string }>(opportunities: T[]): T[] {
    return [...opportunities].sort((a, b) => {
        // Walk-ins first
        if (a.type === 'WALKIN' && b.type !== 'WALKIN') return -1;
        if (a.type !== 'WALKIN' && b.type === 'WALKIN') return 1;

        // Then by posted date (newest first)
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });
}

function isLikelyFresher(profile: Profile): boolean {
    const baseYear = profile.pgYear || profile.gradYear;
    if (!baseYear) return false;
    const currentYear = new Date().getFullYear();
    return (currentYear - baseYear) <= 1;
}

function getExperienceRelevance(opportunity: Opportunity, fresher: boolean): number {
    const minExp = Math.max(0, opportunity.experienceMin ?? 0);
    if (!fresher) {
        // For non-fresher users keep experience neutral, but still nudge lower-exp roles slightly up.
        return Math.max(0.5, 1 - (minExp * 0.08));
    }

    // Fresher-first ordering:
    // 0 yrs => strongest relevance, 1 yr => medium, 2+ => demoted to bottom.
    if (minExp <= 0) return 1;
    if (minExp === 1) return 0.6;
    if (minExp === 2) return 0.2;
    return 0;
}

function getSkillOverlapScore(opportunity: Opportunity, profile: Profile): number {
    if (!opportunity.requiredSkills || opportunity.requiredSkills.length === 0) return 1;
    const userSkills = new Set((profile.skills || []).map((s: string) => s.toLowerCase()));
    if (userSkills.size === 0) return 0;

    const required = opportunity.requiredSkills.map((s: string) => s.toLowerCase());
    const matches = required.filter((skill) => userSkills.has(skill)).length;
    return matches / required.length;
}

function getPassoutExactness(opportunity: Opportunity, profile: Profile): number {
    const years = opportunity.allowedPassoutYears || [];
    if (years.length === 0) return 0.7;
    const userYear = profile.pgYear || profile.gradYear;
    if (!userYear) return 0;
    return years.includes(userYear) ? 1 : 0;
}

function getLocationPreferenceScore(opportunity: Opportunity, profile: Profile): number {
    const preferredCities = (profile.preferredCities || []).map((c: string) => c.toLowerCase());
    if (preferredCities.length === 0) return 0.7;
    const oppLocations = (opportunity.locations || []).map((l: string) => l.toLowerCase());
    return oppLocations.some((loc) => preferredCities.includes(loc)) ? 1 : 0;
}

function getFreshnessBoost(opportunity: Opportunity): number {
    const postedAt = new Date(opportunity.postedAt).getTime();
    const now = Date.now();
    const ageInDays = (now - postedAt) / (24 * 60 * 60 * 1000);
    if (ageInDays <= 1) return 1;
    if (ageInDays <= 3) return 0.7;
    if (ageInDays <= 7) return 0.4;
    return 0;
}

function getUrgencyBoost(opportunity: Opportunity): number {
    if (!opportunity.expiresAt) return 0;
    const expiry = new Date(opportunity.expiresAt).getTime();
    const now = Date.now();
    const remainingInDays = (expiry - now) / (24 * 60 * 60 * 1000);
    if (remainingInDays < 0) return 0;
    if (remainingInDays <= 1) return 1;
    if (remainingInDays <= 3) return 0.7;
    if (remainingInDays <= 5) return 0.4;
    return 0;
}

function computeRelevanceScore(opportunity: Opportunity, profile: Profile): number {
    const fresher = isLikelyFresher(profile);
    const experienceRelevance = getExperienceRelevance(opportunity, fresher);
    const skillOverlap = getSkillOverlapScore(opportunity, profile);
    const passoutExactness = getPassoutExactness(opportunity, profile);
    const locationPreference = getLocationPreferenceScore(opportunity, profile);
    const freshnessBoost = getFreshnessBoost(opportunity);
    const urgencyBoost = getUrgencyBoost(opportunity);

    // Weighted relevance (0-100).
    const score =
        (experienceRelevance * 40) +
        (skillOverlap * 20) +
        (passoutExactness * 15) +
        (locationPreference * 10) +
        (freshnessBoost * 10) +
        (urgencyBoost * 5);

    return Math.round(score);
}

/**
 * Personalized relevance ranking.
 * Keeps only eligible opportunities (done by caller), then orders to show
 * fresher-friendly and high-signal jobs first while keeping all results visible.
 */
export function sortOpportunitiesForUser<T extends Opportunity>(opportunities: T[], profile: Profile): T[] {
    const fresher = isLikelyFresher(profile);

    return [...opportunities]
        .map((opportunity) => ({
            opportunity,
            relevanceScore: computeRelevanceScore(opportunity, profile),
        }))
        .sort((a, b) => {
            if (b.relevanceScore !== a.relevanceScore) {
                return b.relevanceScore - a.relevanceScore;
            }

            // Additional fresher bias when scores tie: lower min experience first.
            if (fresher) {
                const aExp = a.opportunity.experienceMin ?? 0;
                const bExp = b.opportunity.experienceMin ?? 0;
                if (aExp !== bExp) return aExp - bExp;
            }

            // Then urgency (sooner expiry first) and recency fallback.
            const aExpiry = a.opportunity.expiresAt ? new Date(a.opportunity.expiresAt).getTime() : Number.POSITIVE_INFINITY;
            const bExpiry = b.opportunity.expiresAt ? new Date(b.opportunity.expiresAt).getTime() : Number.POSITIVE_INFINITY;
            if (aExpiry !== bExpiry) return aExpiry - bExpiry;

            return new Date(b.opportunity.postedAt).getTime() - new Date(a.opportunity.postedAt).getTime();
        })
        .map((item) => item.opportunity);
}
