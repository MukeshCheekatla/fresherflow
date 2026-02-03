import { checkEligibility, sortOpportunitiesWithWalkinsFirst } from './match';
import { Opportunity, Profile, OpportunityType, OpportunityStatus, EducationLevel, WorkMode, Availability } from '@fresherflow/types';

describe('Eligibility Matching Engine', () => {
    const mockProfile: Profile = {
        id: 'profile-1',
        userId: 'user-1',
        interestedIn: [OpportunityType.JOB],
        preferredCities: ['Bangalore'],
        preferredWorkModes: [WorkMode.REMOTE],
        skills: ['React', 'Node.js'],
        gradYear: 2024,
        educationLevel: EducationLevel.DEGREE,
        completionPercentage: 100,
    };

    const mockOpp: Opportunity = {
        id: 'opp-1',
        title: 'Software Engineer',
        company: 'Tech Corp',
        description: 'Great job',
        type: OpportunityType.JOB,
        locations: ['Bangalore'],
        requiredSkills: ['React'],
        allowedDegrees: [EducationLevel.DEGREE],
        allowedCourses: [],
        allowedPassoutYears: [2024],
        postedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
        status: OpportunityStatus.PUBLISHED,
        workMode: WorkMode.REMOTE,
        adminId: 'admin-1',
    };

    test('should match eligible user', () => {
        const result = checkEligibility(mockOpp, mockProfile);
        expect(result.eligible).toBe(true);
    });

    test('should fail if degree does not match', () => {
        const result = checkEligibility(
            { ...mockOpp, allowedDegrees: [EducationLevel.PG] },
            mockProfile
        );
        expect(result.eligible).toBe(false);
        expect(result.failedRules).toContain('DEGREE_MATCH');
    });

    test('should fail if passout year does not match', () => {
        const result = checkEligibility(
            { ...mockOpp, allowedPassoutYears: [2023] },
            mockProfile
        );
        expect(result.eligible).toBe(false);
        expect(result.failedRules).toContain('PASSOUT_YEAR_MATCH');
    });

    test('should fail if skills do not overlap', () => {
        const result = checkEligibility(
            { ...mockOpp, requiredSkills: ['Python'] },
            mockProfile
        );
        expect(result.eligible).toBe(false);
        expect(result.failedRules).toContain('SKILLS_MATCH');
    });

    test('should provide warnings for soft rules like location', () => {
        const result = checkEligibility(
            { ...mockOpp, locations: ['Pune'] },
            mockProfile
        );
        expect(result.eligible).toBe(true);
        expect(result.warnings).toBeDefined();
        expect(result.warnings?.[0]).toContain('Pune');
    });
});

describe('Sorting Logic', () => {
    const opps = [
        { id: '1', type: 'FULL_TIME', postedAt: '2024-01-01' },
        { id: '2', type: 'WALKIN', postedAt: '2024-01-02' },
        { id: '3', type: 'FULL_TIME', postedAt: '2024-01-03' },
    ] as any[];

    test('should sort walk-ins first, then by date', () => {
        const sorted = sortOpportunitiesWithWalkinsFirst(opps);
        expect(sorted[0].id).toBe('2'); // Walk-in
        expect(sorted[1].id).toBe('3'); // Newest Full-time
        expect(sorted[2].id).toBe('1'); // Oldest Full-time
    });
});
