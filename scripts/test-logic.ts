
import { getVisibleJobs } from '../src/lib/utils';
import { Job, MAX_JOB_AGE_DAYS } from '../src/lib/types';

const now = new Date();
const ONE_DAY = 24 * 60 * 60 * 1000;

function createJob(override: Partial<Job>): Job {
    return {
        id: Math.random().toString(),
        title: 'Test Job',
        company: 'Test Co',
        location: 'Remote',
        type: 'Full-time',
        remote: true,
        applyUrl: 'https://example.com',
        source: 'company_site',
        postedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + ONE_DAY).toISOString(),
        verified: false, // Initial state, should be overwritten
        ...override
    };
}

console.log('Running Logic Verification...');

const testCases = [
    {
        name: 'FAIL: Expired Job',
        job: createJob({
            expiresAt: new Date(now.getTime() - ONE_DAY).toISOString(),
            title: 'Expired Job'
        }),
        shouldBeVisible: false
    },
    {
        name: 'FAIL: Future Job',
        job: createJob({
            postedAt: new Date(now.getTime() + ONE_DAY).toISOString(),
            title: 'Future Job'
        }),
        shouldBeVisible: false
    },
    {
        name: 'FAIL: Old Job (> 10 Days)',
        job: createJob({
            postedAt: new Date(now.getTime() - (MAX_JOB_AGE_DAYS + 1) * ONE_DAY).toISOString(),
            title: 'Old Job'
        }),
        shouldBeVisible: false
    },
    {
        name: 'PASS: Fresh Job',
        job: createJob({
            title: 'Fresh Job'
        }),
        shouldBeVisible: true
    },
    {
        name: 'VERIFY: Unverified Source',
        job: createJob({
            source: 'telegram',
            title: 'Telegram Job'
        }),
        shouldBeVisible: true,
        check: (j: Job) => j.verified === false
    },
    {
        name: 'VERIFY: Verified Source',
        job: createJob({
            source: 'referral',
            title: 'Referral Job'
        }),
        shouldBeVisible: true, // Should be visible
        check: (j: Job) => j.verified === true // And marked verified
    }
];

const jobs = testCases.map(tc => tc.job);

// Also add filler jobs to test limit
for (let i = 0; i < 25; i++) {
    jobs.push(createJob({ title: `Filler ${i}`, source: 'company_site' }));
}

console.log(`Total Input Jobs: ${jobs.length}`);

const visible = getVisibleJobs(jobs);

console.log(`Visible Jobs: ${visible.length}`);

// Validations
let errors: string[] = [];

// 1. Check Limits
if (visible.length > 20) errors.push(`ERROR: Exceeded limit. Got ${visible.length}`);

// 2. Check Test Cases
testCases.forEach(tc => {
    const found = visible.find(j => j.id === tc.job.id);

    if (tc.shouldBeVisible && !found) {
        errors.push(`ERROR: ${tc.name} should be visible but is missing.`);
    } else if (!tc.shouldBeVisible && found) {
        errors.push(`ERROR: ${tc.name} should NOT be visible but is present.`);
    } else if (found && tc.check) {
        if (!tc.check(found)) {
            errors.push(`ERROR: ${tc.name} failed attribute check.`);
        }
    }
});

if (errors.length > 0) {
    console.error('FAILED:');
    errors.forEach(e => console.error(e));
    process.exit(1);
} else {
    console.log('SUCCESS: All logic checks passed.');
}
