import morgan, { TokenIndexer } from 'morgan';
import chalk from 'chalk';
import { IncomingMessage, ServerResponse } from 'http';

const isProd = process.env.NODE_ENV === 'production';

const noisyProbePatterns = [
    /\.env/i,
    /phpinfo|wp-|xmlrpc|wlwmanifest|phpmyadmin|server-status|\.php/i,
    /sitemap\.xml|robots\.txt|favicon\.ico/i,
    /node_modules|vendor|storage|config|\.yml|\.ini|\.log/i
];

const isNoisyProbe = (url: string, status: number) => {
    if (status !== 404) return false;
    return noisyProbePatterns.some((pattern) => pattern.test(url));
};

morgan.token('request-id', (req: IncomingMessage & { requestId?: string }) => {
    const headerValue = req.headers['x-request-id'];
    const fromHeader = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    return req.requestId || fromHeader || '-';
});

const devFormat = (tokens: TokenIndexer<IncomingMessage, ServerResponse>, req: IncomingMessage, res: ServerResponse) => {
    const method = tokens.method(req, res) || '';
    const url = tokens.url(req, res) || '';
    const status = Number(tokens.status(req, res)) || 0;
    const responseTime = Number(tokens['response-time'](req, res) || 0);
    const time = new Date().toLocaleTimeString();
    const requestId = tokens['request-id'](req, res) || '-';

    let statusColor = chalk.gray;
    if (status >= 500) statusColor = chalk.red;
    else if (status >= 400) statusColor = chalk.yellow;
    else if (status >= 300) statusColor = chalk.cyan;
    else if (status >= 200) statusColor = chalk.green;

    const methodColors: Record<string, (value: string) => string> = {
        GET: chalk.blue,
        POST: chalk.green,
        PUT: chalk.yellow,
        PATCH: chalk.yellow,
        DELETE: chalk.red,
    };
    const methodColor = methodColors[method] || chalk.white;

    let timeColor = chalk.gray;
    if (responseTime > 1000) timeColor = chalk.red;
    else if (responseTime > 500) timeColor = chalk.yellow;
    else if (responseTime > 100) timeColor = chalk.cyan;

    return [
        chalk.gray(time),
        methodColor(method.padEnd(6)),
        statusColor(String(status).padEnd(3)),
        chalk.white(url),
        timeColor(`${responseTime.toFixed(0)}ms`),
        chalk.gray(`[${String(requestId).slice(0, 8)}]`)
    ].join(' ');
};

const prodFormat = (tokens: TokenIndexer<IncomingMessage, ServerResponse>, req: IncomingMessage, res: ServerResponse) => {
    const status = Number(tokens.status(req, res)) || 0;
    const url = tokens.url(req, res) || '';

    if (isNoisyProbe(url, status)) return undefined;

    return JSON.stringify({
        event: 'http_request',
        timestamp: new Date().toISOString(),
        requestId: tokens['request-id'](req, res) || '-',
        method: tokens.method(req, res) || '',
        path: url,
        status,
        durationMs: Number(tokens['response-time'](req, res) || 0),
        contentLength: Number(tokens.res(req, res, 'content-length') || 0),
        userAgent: req.headers['user-agent'] || '',
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || ''
    });
};

export const httpLogger = morgan(isProd ? prodFormat : devFormat, {
    skip: (req, res) => (!isProd && isNoisyProbe(req.url || '', res.statusCode || 0))
});

export default httpLogger;
