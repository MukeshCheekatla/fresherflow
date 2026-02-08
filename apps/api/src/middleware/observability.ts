import { Request, Response, NextFunction } from 'express';

type RouteMetrics = {
    requests: number;
    errors: number;
    totalLatencyMs: number;
    maxLatencyMs: number;
};

type MetricsSnapshot = {
    uptimeSec: number;
    totals: {
        requests: number;
        errors: number;
        errorRatePct: number;
        avgLatencyMs: number;
        p95LatencyMs: number;
    };
    routes: Record<string, {
        requests: number;
        errors: number;
        errorRatePct: number;
        avgLatencyMs: number;
        maxLatencyMs: number;
    }>;
};

const startedAt = Date.now();
const routeStats = new Map<string, RouteMetrics>();
const latencyWindowMs: number[] = [];
const LATENCY_WINDOW_LIMIT = 1000;

let totalRequests = 0;
let totalErrors = 0;
let totalLatencyMs = 0;

function percentile(values: number[], p: number): number {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
    return sorted[index];
}

function routeKey(req: Request): string {
    const method = req.method.toUpperCase();
    const routePath = req.route?.path;
    const baseUrl = req.baseUrl || '';
    if (routePath) {
        return `${method} ${baseUrl}${routePath}`;
    }
    return `${method} ${req.path}`;
}

export function observabilityMiddleware(req: Request, res: Response, next: NextFunction) {
    const started = process.hrtime.bigint();

    res.on('finish', () => {
        const ended = process.hrtime.bigint();
        const latencyMs = Number(ended - started) / 1_000_000;
        const key = routeKey(req);
        const isError = res.statusCode >= 400;

        totalRequests += 1;
        totalLatencyMs += latencyMs;
        if (isError) totalErrors += 1;

        latencyWindowMs.push(latencyMs);
        if (latencyWindowMs.length > LATENCY_WINDOW_LIMIT) {
            latencyWindowMs.shift();
        }

        const existing = routeStats.get(key) || {
            requests: 0,
            errors: 0,
            totalLatencyMs: 0,
            maxLatencyMs: 0
        };
        existing.requests += 1;
        existing.totalLatencyMs += latencyMs;
        if (isError) existing.errors += 1;
        if (latencyMs > existing.maxLatencyMs) existing.maxLatencyMs = latencyMs;
        routeStats.set(key, existing);
    });

    next();
}

export function getObservabilityMetrics(): MetricsSnapshot {
    const routes: MetricsSnapshot['routes'] = {};
    for (const [key, stats] of routeStats.entries()) {
        const avgLatencyMs = stats.requests ? stats.totalLatencyMs / stats.requests : 0;
        const errorRatePct = stats.requests ? (stats.errors / stats.requests) * 100 : 0;
        routes[key] = {
            requests: stats.requests,
            errors: stats.errors,
            errorRatePct: Number(errorRatePct.toFixed(2)),
            avgLatencyMs: Number(avgLatencyMs.toFixed(2)),
            maxLatencyMs: Number(stats.maxLatencyMs.toFixed(2))
        };
    }

    const avgLatency = totalRequests ? totalLatencyMs / totalRequests : 0;
    const errorRate = totalRequests ? (totalErrors / totalRequests) * 100 : 0;

    return {
        uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
        totals: {
            requests: totalRequests,
            errors: totalErrors,
            errorRatePct: Number(errorRate.toFixed(2)),
            avgLatencyMs: Number(avgLatency.toFixed(2)),
            p95LatencyMs: Number(percentile(latencyWindowMs, 95).toFixed(2))
        },
        routes
    };
}

