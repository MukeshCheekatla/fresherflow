import { z } from 'zod';
import { OpportunityType, WorkMode, EducationLevel, Availability, ActionType, FeedbackReason } from '@prisma/client';

// Auth Schemas
export const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(1, 'Full name is required')
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
});

// Profile Schemas
export const educationSchema = z.object({
    educationLevel: z.nativeEnum(EducationLevel),

    // 10th Details
    tenthYear: z.number().int().min(1000, 'Year must be 4 digits').max(9999, 'Year must be 4 digits'),

    // 12th Details
    twelfthYear: z.number().int().min(1000, 'Year must be 4 digits').max(9999, 'Year must be 4 digits'),

    // Graduation Details
    gradCourse: z.string().min(1, 'Course name is required'),
    gradSpecialization: z.string().min(1, 'Specialization is required'),
    gradYear: z.number().int().min(1000, 'Year must be 4 digits').max(9999, 'Year must be 4 digits'),

    // PG (Optional)
    pgCourse: z.string().optional(),
    pgSpecialization: z.string().optional(),
    pgYear: z.number().int().min(1000, 'Year must be 4 digits').max(9999, 'Year must be 4 digits').optional()
});

export const preferencesSchema = z.object({
    interestedIn: z.array(z.nativeEnum(OpportunityType)).min(1, 'Select at least one opportunity type'),
    preferredCities: z.array(z.string()).min(1).max(5, 'Select 1-5 cities'),
    workModes: z.array(z.nativeEnum(WorkMode)).min(1, 'Select at least one work mode')
});

export const readinessSchema = z.object({
    availability: z.nativeEnum(Availability),
    skills: z.array(z.string()).min(1, 'Add at least one skill')
});

// Admin Schemas
export const opportunitySchema = z.object({
    type: z.nativeEnum(OpportunityType),
    title: z.string().min(1, 'Title is required'),
    company: z.string().min(1, 'Company is required'),
    description: z.string().min(10, 'Description must be at least 10 characters').optional(),
    allowedDegrees: z.array(z.nativeEnum(EducationLevel)).min(1, 'Select at least one degree'),
    allowedPassoutYears: z.array(z.number().int()).optional().default([]),
    requiredSkills: z.array(z.string()).default([]),
    locations: z.array(z.string()).min(1, 'Add at least one location'),
    workMode: z.nativeEnum(WorkMode).optional(),
    salaryMin: z.number().int().positive().optional(),
    salaryMax: z.number().int().positive().optional(),
    applyLink: z.string().url().optional(),
    expiresAt: z.string().optional(),
    // Walk-in specific (optional)
    walkInDetails: z.object({
        dates: z.array(z.string()).optional(),
        venueAddress: z.string().optional(),
        reportingTime: z.string().optional(),
        requiredDocuments: z.array(z.string()).optional(),
        contactPerson: z.string().optional(),
        contactPhone: z.string().optional()
    }).optional()
}).refine(data => {
    // If type is WALKIN, walkInDetails is required
    if (data.type === 'WALKIN') {
        return data.walkInDetails &&
            data.walkInDetails.dates &&
            data.walkInDetails.venueAddress &&
            data.walkInDetails.reportingTime;
    }
    return true;
}, {
    message: 'Walk-in details are required for WALKIN opportunities'
});

// User Action Schemas
export const userActionSchema = z.object({
    actionType: z.nativeEnum(ActionType)
});

export const feedbackSchema = z.object({
    reason: z.nativeEnum(FeedbackReason)
});

