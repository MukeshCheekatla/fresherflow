export interface Alert {
    userId: string;
    conditions: {
        minSalary?: number;
        roles?: string[];
        locations?: string[];
        workType?: ('remote' | 'hybrid' | 'onsite')[];
    };
    delivery: ('email' | 'push')[];
    isTemporary: boolean;
    expiresAt?: string;
    createdAt: string;
}
