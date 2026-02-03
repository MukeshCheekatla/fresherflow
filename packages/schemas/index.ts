// Shared Zod Validation Schemas - Single Source of Truth
// Both API and Web can use these for validation
// This package NEVER imports from apps

import { z } from 'zod';
import {
    OpportunityType,
    EducationLevel,
    WorkMode,
    Availability,
    UserActionStatus,
    FeedbackReason
} from '@fresherflow/types';

// ========================================
// AUTH SCHEMAS
// ========================================

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(2, 'Name must be at least 2 characters')
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

// ========================================
// PROFILE SCHEMAS
// ========================================

export const educationSchema = z.object({
    educationLevel: z.nativeEnum(EducationLevel),
    course: z.string().min(1, 'Course is required'),
    specialization: z.string().min(1, 'Specialization is required'),
    passoutYear: z.number()
        .int('Year must be an integer')
        .min(2020, 'Year must be 2020 or later')
        .max(2030, 'Year must be 2030 or earlier')
});

export const preferencesSchema = z.object({
    interestedIn: z.array(z.nativeEnum(OpportunityType))
        .min(1, 'Select at least one opportunity type'),
    preferredCities: z.array(z.string())
        .min(1, 'Select at least one city'),
    preferredWorkModes: z.array(z.nativeEnum(WorkMode))
        .min(1, 'Select at least one work mode')
});

export const readinessSchema = z.object({
    availability: z.nativeEnum(Availability),
    skills: z.array(z.string())
        .min(1, 'Add at least one skill')
});

// ========================================
// OPPORTUNITY SCHEMAS
// ========================================

export const walkInDetailsSchema = z.object({
    dates: z.array(z.string()).min(1, 'At least one date is required'),
    venueAddress: z.string().min(10, 'Venue address is required'),
    reportingTime: z.string().min(1, 'Reporting time is required'),
    requiredDocuments: z.array(z.string()),
    contactPerson: z.string().optional(),
    contactPhone: z.string().optional()
});

export const opportunitySchema = z.object({
    type: z.nativeEnum(OpportunityType),
    title: z.string().min(5, 'Title must be at least 5 characters'),
    company: z.string().min(2, 'Company name is required'),
    description: z.string().min(20, 'Description must be at least 20 characters'),

    allowedDegrees: z.array(z.nativeEnum(EducationLevel))
        .min(1, 'Select at least one degree type'),
    allowedPassoutYears: z.array(z.number())
        .min(1, 'Select at least one passout year'),
    requiredSkills: z.array(z.string()),

    locations: z.array(z.string())
        .min(1, 'At least one location is required'),
    workMode: z.nativeEnum(WorkMode).optional(),

    salaryMin: z.number().int().positive().optional(),
    salaryMax: z.number().int().positive().optional(),

    applyLink: z.string().url().optional(),
    expiresAt: z.string().datetime().optional(),

    // Walk-in details only required if type is WALKIN
    walkInDetails: walkInDetailsSchema.optional()
}).refine(
    (data) => {
        // If type is WALKIN, walkInDetails is required
        if (data.type === OpportunityType.WALKIN) {
            return !!data.walkInDetails;
        }
        return true;
    },
    {
        message: 'Walk-in details are required for walk-in opportunities',
        path: ['walkInDetails']
    }
).refine(
    (data) => {
        // If type is not WALKIN, applyLink is required
        if (data.type !== OpportunityType.WALKIN) {
            return !!data.applyLink;
        }
        return true;
    },
    {
        message: 'Apply link is required for jobs and internships',
        path: ['applyLink']
    }
).refine(
    (data) => {
        // If salaryMax is provided, it must be greater than salaryMin
        if (data.salaryMin && data.salaryMax) {
            return data.salaryMax >= data.salaryMin;
        }
        return true;
    },
    {
        message: 'Maximum salary must be greater than or equal to minimum salary',
        path: ['salaryMax']
    }
);

// ========================================
// USER ACTION SCHEMAS
// ========================================

export const trackActionSchema = z.object({
    status: z.nativeEnum(UserActionStatus)
});

export const submitFeedbackSchema = z.object({
    reason: z.nativeEnum(FeedbackReason)
});

// ========================================
// FILTER SCHEMAS
// ========================================

export const opportunityFiltersSchema = z.object({
    type: z.nativeEnum(OpportunityType).optional(),
    city: z.string().optional(),
    closingSoon: z.boolean().optional()
});

export const adminOpportunityFiltersSchema = z.object({
    type: z.nativeEnum(OpportunityType).optional(),
    status: z.enum(['ACTIVE', 'EXPIRED', 'REMOVED']).optional()
});

// ========================================
// TYPE EXPORTS (for TypeScript inference)
// ========================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type ReadinessInput = z.infer<typeof readinessSchema>;
export type OpportunityInput = z.infer<typeof opportunitySchema>;
export type TrackActionInput = z.infer<typeof trackActionSchema>;
export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
export type OpportunityFiltersInput = z.infer<typeof opportunityFiltersSchema>;
export type AdminOpportunityFiltersInput = z.infer<typeof adminOpportunityFiltersSchema>;
