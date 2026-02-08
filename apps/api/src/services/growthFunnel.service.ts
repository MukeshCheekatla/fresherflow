type FunnelEvent = 'DETAIL_VIEW' | 'LOGIN_VIEW' | 'AUTH_SUCCESS' | 'SIGNUP_SUCCESS';

type SourceCounters = Record<FunnelEvent, number>;

const sourceMetrics = new Map<string, SourceCounters>();

function emptyCounters(): SourceCounters {
    return {
        DETAIL_VIEW: 0,
        LOGIN_VIEW: 0,
        AUTH_SUCCESS: 0,
        SIGNUP_SUCCESS: 0
    };
}

function sanitizeSource(source?: string): string {
    const value = (source || '').trim().toLowerCase();
    if (!value) return 'unknown';
    return value.replace(/[^a-z0-9_-]/g, '').slice(0, 64) || 'unknown';
}

export function recordGrowthEvent(source?: string, event?: string) {
    const sanitizedSource = sanitizeSource(source);
    const normalizedEvent = (event || '').trim().toUpperCase() as FunnelEvent;
    if (!['DETAIL_VIEW', 'LOGIN_VIEW', 'AUTH_SUCCESS', 'SIGNUP_SUCCESS'].includes(normalizedEvent)) return;

    const existing = sourceMetrics.get(sanitizedSource) || emptyCounters();
    existing[normalizedEvent] += 1;
    sourceMetrics.set(sanitizedSource, existing);
}

export function recordAuthSuccess(source?: string, isSignup = false) {
    recordGrowthEvent(source, 'AUTH_SUCCESS');
    if (isSignup) {
        recordGrowthEvent(source, 'SIGNUP_SUCCESS');
    }
}

export function getGrowthFunnelMetrics() {
    const rows = Array.from(sourceMetrics.entries()).map(([source, counters]) => {
        const detailToLoginPct = counters.DETAIL_VIEW > 0
            ? Number(((counters.LOGIN_VIEW / counters.DETAIL_VIEW) * 100).toFixed(2))
            : 0;
        const loginToAuthPct = counters.LOGIN_VIEW > 0
            ? Number(((counters.AUTH_SUCCESS / counters.LOGIN_VIEW) * 100).toFixed(2))
            : 0;

        return {
            source,
            ...counters,
            detailToLoginPct,
            loginToAuthPct
        };
    });

    rows.sort((a, b) => b.AUTH_SUCCESS - a.AUTH_SUCCESS);

    return {
        totals: rows.reduce((acc, row) => {
            acc.DETAIL_VIEW += row.DETAIL_VIEW;
            acc.LOGIN_VIEW += row.LOGIN_VIEW;
            acc.AUTH_SUCCESS += row.AUTH_SUCCESS;
            acc.SIGNUP_SUCCESS += row.SIGNUP_SUCCESS;
            return acc;
        }, emptyCounters()),
        sources: rows
    };
}
