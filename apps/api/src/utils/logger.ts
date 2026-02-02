import winston from 'winston';

// ANSI color codes for clean terminal output
const colors = {
    reset: '\x1b[0m',
    gray: '\x1b[90m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    green: '\x1b[32m'
};

// Custom format for clean, minimal output (like Next.js)
const cleanFormat = winston.format.printf(({ level, message, timestamp, requestId, ...meta }) => {
    const time = new Date(timestamp as string).toLocaleTimeString();
    const reqId = (requestId && typeof requestId === 'string') ? `${colors.gray}[${requestId.substring(0, 8)}]${colors.reset}` : '';

    // Color-code by level
    let prefix = '';
    if (level.includes('info')) prefix = `${colors.cyan}●${colors.reset}`;
    else if (level.includes('warn')) prefix = `${colors.yellow}⚠${colors.reset}`;
    else if (level.includes('error')) prefix = `${colors.red}✖${colors.reset}`;
    else prefix = `${colors.gray}○${colors.reset}`;

    // Clean message without extra metadata (unless error)
    const metaStr = level.includes('error') && Object.keys(meta).length
        ? `${colors.gray}${JSON.stringify(meta)}${colors.reset}`
        : '';

    return `${colors.gray}${time}${colors.reset} ${prefix} ${message} ${reqId} ${metaStr}`;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true })
    ),
    defaultMeta: { service: 'yearhire-api' },
    transports: [
        new winston.transports.Console({
            format: cleanFormat
        })
    ]
});

export default logger;
