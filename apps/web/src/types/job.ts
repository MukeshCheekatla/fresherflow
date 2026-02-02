// Job Types

export interface OnlineJob {
    id: string;
    normalizedRole: string;
    company: string;
    experienceRange: {
        min: number;
        max: number;
    };
    mustHaveSkills: string[];
    niceToHaveSkills: string[];
    workType: 'remote' | 'hybrid' | 'onsite';
    salary: {
        min: number;
        max: number;
        currency: string;
    } | null;
    employmentType: 'JOB' | 'INTERNSHIP' | 'WALKIN' | 'CONTRACT';
    locations: string[];
    applyLink: string;
    source: string;
    postedAt: string;
    lastVerified: string;
}
