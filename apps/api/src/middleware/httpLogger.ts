import morgan, { TokenIndexer } from 'morgan';
import chalk from 'chalk';
import { IncomingMessage, ServerResponse } from 'http';

// Custom Morgan format with colors
export const httpLogger = morgan((tokens: TokenIndexer<IncomingMessage, ServerResponse>, req: IncomingMessage, res: ServerResponse) => {
    const method = tokens.method(req, res) || '';
    const url = tokens.url(req, res) || '';
    const status = Number(tokens.status(req, res)) || 0;
    const responseTime = tokens['response-time'](req, res) || '0';
    const time = new Date().toLocaleTimeString();

    // Color-code by status
    let statusColor = chalk.gray;
    if (status >= 500) statusColor = chalk.red;
    else if (status >= 400) statusColor = chalk.yellow;
    else if (status >= 300) statusColor = chalk.cyan;
    else if (status >= 200) statusColor = chalk.green;

    // Color-code method
    const methodColors: Record<string, any> = {
        GET: chalk.blue,
        POST: chalk.green,
        PUT: chalk.yellow,
        PATCH: chalk.yellow,
        DELETE: chalk.red,
    };
    const methodColor = methodColors[method] || chalk.white;

    // Format response time
    const responseTimeMs = parseFloat(responseTime);
    let timeColor = chalk.gray;
    if (responseTimeMs > 1000) timeColor = chalk.red;
    else if (responseTimeMs > 500) timeColor = chalk.yellow;
    else if (responseTimeMs > 100) timeColor = chalk.cyan;

    return [
        chalk.gray(time),
        methodColor(method.padEnd(6)),
        statusColor(status),
        chalk.white(url),
        timeColor(`${responseTimeMs.toFixed(0)}ms`)
    ].join(' ');
});

export default httpLogger;
