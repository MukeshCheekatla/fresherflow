// Walk-in Types

export interface WalkinJob {
    id: string;
    company: string;
    role: string;
    city: string;
    walkInDate: string;
    venue: string;
    reportingTime: string;
    lastValidDay: string;
    eligibility: string[];
    contactInfo?: string;
}
