export interface BaseJob {
    company: string;
    experienceRange: { min: number; max: number }; // years
    postedAt: string; // ISO date
    lastVerified: string;
}

export interface OnlineJob extends BaseJob {
    normalizedRole: string;
    mustHaveSkills: string[];
    niceToHaveSkills: string[];
    locations: string[];
    workType: 'remote' | 'hybrid' | 'onsite';
    salary: { min: number; max: number; currency: string } | null;
    employmentType: 'full-time' | 'contract' | 'internship';
    applyLink: string;
    source: string;
}

export type UserIntent = 'same-role-better-company' | 'same-role-higher-pay' | 'career-switch' | 'fresher';

export interface JobFilters {
    intent?: UserIntent;
    experienceMin?: number;
    experienceMax?: number;
    skills?: string[];
    locations?: string[];
    minSalary?: number;
    workType?: ('remote' | 'hybrid' | 'onsite')[];
}
