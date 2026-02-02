// API Response Types

// User & Profile Types
export interface User {
    id: string;
    email: string;
    fullName: string;
}

export interface Profile {
    completionPercentage: number;
    educationLevel?: string;
    courseName?: string;
    specialization?: string;
    passoutYear?: number;
    interestedIn?: string[];
    preferredCities?: string[];
    workModes?: string[];
    availability?: string;
    skills?: string[];
}


export interface Opportunity {
    id: string;
    type: 'JOB' | 'INTERNSHIP' | 'WALKIN';
    title: string;
    company: string;
    description: string;
    locations: string[];
    requiredSkills: string[];
    allowedDegrees: string[];
    allowedPassoutYears: number[];
    workMode?: 'REMOTE' | 'HYBRID' | 'ONSITE';
    salaryMin?: number;
    salaryMax?: number;
    postedAt: string;
    expiresAt?: string;
    applyLink?: string;
    admin?: {
        fullName: string;
    };
    walkInDetails?: {
        venueAddress: string;
        reportingTime: string;
        dates: string[];
        requiredDocuments: string[];
        contactPerson?: string;
        contactPhone?: string;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface AuthResponse {
    user: User;
    profile: Profile;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

export interface ApiError {
    error: {
        message: string;
    };
}
