import { Profile, EducationLevel, OpportunityType, WorkMode, Availability } from '@prisma/client';

export function calculateCompletion(profile: Profile): number {
    let completion = 0;

    // Education Details (40% weight)
    const educationComplete =
        profile.educationLevel &&
        profile.courseName &&
        profile.specialization &&
        profile.passoutYear;

    if (educationComplete) {
        completion += 40;
    }

    // Opportunity Preferences (40% weight)
    const preferencesComplete =
        profile.interestedIn.length > 0 &&
        profile.preferredCities.length > 0 &&
        profile.workModes.length > 0;

    if (preferencesComplete) {
        completion += 40;
    }

    // Readiness Status (20% weight)
    const readinessComplete =
        profile.availability &&
        profile.skills.length > 0;

    if (readinessComplete) {
        completion += 20;
    }

    return completion;
}

// Validation helpers
export function isProfileComplete(profile: Profile): boolean {
    return calculateCompletion(profile) === 100;
}
