// Shared Types - Single Source of Truth
// Apps can import from here. This package NEVER imports from apps.

// ========================================
// ENUMS - Match Prisma schema exactly
// ========================================

export enum OpportunityType {
    JOB = 'JOB',
    INTERNSHIP = 'INTERNSHIP',
    WALKIN = 'WALKIN'
}

export enum OpportunityStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED'
}

export enum EducationLevel {
    DIPLOMA = 'DIPLOMA',
    DEGREE = 'DEGREE',
    PG = 'PG'
}

export enum WorkMode {
    ONSITE = 'ONSITE',
    HYBRID = 'HYBRID',
    REMOTE = 'REMOTE'
}

export enum Availability {
    IMMEDIATE = 'IMMEDIATE',
    WITHIN_MONTH = 'WITHIN_MONTH',
    AFTER_2_MONTHS = 'AFTER_2_MONTHS'
}

export enum UserActionStatus {
    APPLIED = 'APPLIED',
    PLANNING = 'PLANNING',
    ATTENDED = 'ATTENDED',
    NOT_ELIGIBLE = 'NOT_ELIGIBLE'
}

export enum FeedbackReason {
    LINK_BROKEN = 'LINK_BROKEN',
    EXPIRED = 'EXPIRED',
    DUPLICATE = 'DUPLICATE',
    MISLEADING = 'MISLEADING'
}

// ========================================
// CORE ENTITY TYPES
// ========================================

export interface User {
    id: string;
    email: string;
    fullName: string;
    createdAt: Date;
    profile?: Profile;
}

export interface Profile {
    id: string;
    userId: string;
    completionPercentage: number;

    // Education (40% weight)
    educationLevel?: EducationLevel;
    tenthYear?: number;
    twelfthYear?: number;
    gradCourse?: string;
    gradSpecialization?: string;
    gradYear?: number;
    pgCourse?: string;
    pgSpecialization?: string;
    pgYear?: number;

    // Preferences (40% weight)
    interestedIn: OpportunityType[];
    preferredCities: string[];
    preferredWorkModes: WorkMode[];
    workModes?: WorkMode[]; // UI Mapping alias

    // Readiness (20% weight)
    availability?: Availability;
    skills: string[];
    skillTags?: string[]; // UI Mapping alias
}

export interface Admin {
    id: string;
    email: string;
    fullName: string;
    createdAt: Date;
}

export interface Opportunity {
    id: string;
    type: OpportunityType;
    status: OpportunityStatus;

    // Basic Info
    title: string;
    company: string;
    description: string;

    // Eligibility
    allowedDegrees: EducationLevel[];
    allowedCourses: string[];
    allowedPassoutYears: number[];
    requiredSkills: string[];

    // Location
    locations: string[];
    workMode?: WorkMode;

    // Compensation
    salaryMin?: number;
    salaryMax?: number;
    salaryRange?: string;
    stipend?: string;
    employmentType?: string;

    // UI Mapping Support
    salary?: {
        min: number;
        max: number;
        currency?: string;
    } | null;

    // Selection criteria
    experienceRange?: {
        min: number;
        max: number;
    };
    normalizedRole?: string;

    // Application
    applyLink?: string;

    // Administrative
    postedAt: Date;
    expiresAt?: Date | string;
    adminId: string;
    admin?: Admin;

    // Walk-in Details (only if type === WALKIN)
    walkInDetails?: WalkInDetails;
}

export interface WalkInDetails {
    id: string;
    opportunityId: string;
    dates: string[];
    venueAddress: string;
    reportingTime: string;
    requiredDocuments: string[];
    contactPerson?: string;
    contactPhone?: string;
}

export interface UserAction {
    id: string;
    userId: string;
    opportunityId: string;
    status: UserActionStatus;
    createdAt: Date;
    opportunity?: Opportunity;
}

export interface ListingFeedback {
    id: string;
    userId: string;
    opportunityId: string;
    reason: FeedbackReason;
    createdAt: Date;
    user?: User;
    opportunity?: Opportunity;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface AuthResponse {
    user: User;
    profile?: {
        completionPercentage: number;
    } | Profile;
}

export interface ProfileResponse {
    profile: Profile;
}

export interface OpportunitiesResponse {
    opportunities: Opportunity[];
    total: number;
}

export interface OpportunityDetailResponse {
    opportunity: Opportunity;
    isEligible: boolean;
    userAction?: UserAction;
}

export interface UserStatsResponse {
    appliedCount: number;
    planningCount: number;
    attendedCount: number;
}

// ========================================
// API REQUEST TYPES
// ========================================

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UpdateEducationRequest {
    educationLevel: EducationLevel;
    course: string;
    specialization: string;
    passoutYear: number;
}

export interface UpdatePreferencesRequest {
    interestedIn: OpportunityType[];
    preferredCities: string[];
    preferredWorkModes: WorkMode[];
}

export interface UpdateReadinessRequest {
    availability: Availability;
    skills: string[];
}

export interface CreateOpportunityRequest {
    type: OpportunityType;
    title: string;
    company: string;
    description: string;
    allowedDegrees: EducationLevel[];
    allowedCourses: string[];
    allowedPassoutYears: number[];
    requiredSkills: string[];
    locations: string[];
    workMode?: WorkMode;
    salaryMin?: number;
    salaryMax?: number;
    applyLink?: string;
    expiresAt?: string;
    walkInDetails?: {
        dates: string[];
        venueAddress: string;
        reportingTime: string;
        requiredDocuments: string[];
        contactPerson?: string;
        contactPhone?: string;
    };
}

export interface TrackActionRequest {
    status: UserActionStatus;
}

export interface SubmitFeedbackRequest {
    reason: FeedbackReason;
}

// ========================================
// FILTER/QUERY TYPES
// ========================================

export interface OpportunityFilters {
    type?: OpportunityType;
    city?: string;
    closingSoon?: boolean;
}

export interface AdminOpportunityFilters {
    type?: OpportunityType;
    status?: OpportunityStatus;
}
