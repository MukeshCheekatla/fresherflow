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
