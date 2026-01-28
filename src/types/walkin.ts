import { BaseJob } from './job';

export interface WalkinJob extends BaseJob {
    roles: string[];
    exactAddress: string;
    city: string;
    walkInDate: string;
    walkInTimeWindow: string;
    lastValidDay: string;
}
