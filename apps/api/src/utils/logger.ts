import winston from 'winston';
import chalk from 'chalk';

const isProd = process.env.NODE_ENV === 'production';
const useJsonLogs = process.env.LOG_FORMAT === 'json' || isProd;

const sanitizeMeta = (meta: Record<string, unknown>) => {
    if (!meta.error || typeof meta.error !== 'object') return meta;

    const err = meta.error as Error;
    return {
        ...meta,
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack
        }
    };
};

// Human-friendly dev format; production uses JSON for machine parsing.
const consoleFormat = winston.format.printf(({ level, message, timestamp, requestId, ...meta }) => {
    const time = chalk.gray(new Date(timestamp as string).toLocaleTimeString());
    const reqId = requestId && typeof requestId === 'string' ? chalk.gray(`[${requestId.substring(0, 8)}]`) : '';

    const levelStyles: Record<string, (value: string) => string> = {
        info: chalk.blue,
        warn: chalk.yellow,
        error: chalk.red,
        debug: chalk.cyan
    };

    const renderLevel = (levelStyles[level] || chalk.white)(level.toUpperCase().padEnd(5));
    const metaEntries = Object.keys(meta).length > 0 ? chalk.dim(JSON.stringify(sanitizeMeta(meta as Record<string, unknown>))) : '';

    return `${time} ${renderLevel} ${chalk.white(String(message))} ${reqId} ${metaEntries}`.trim();
});

const logger = winston.createLogger({
    level: isProd ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true })
    ),
    defaultMeta: { service: 'fresherflow-api' },
    transports: [
        new winston.transports.Console({
            format: useJsonLogs
                ? winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.errors({ stack: true }),
                    winston.format.json()
                )
                : consoleFormat
        })
    ]
});

// Helper methods
export const log = {
    info: (message: string, meta?: unknown) => logger.info(message, meta),
    warn: (message: string, meta?: unknown) => logger.warn(message, meta),
    error: (message: string, meta?: unknown) => logger.error(message, meta),
    debug: (message: string, meta?: unknown) => logger.debug(message, meta),
    success: (message: string) => logger.info(`SUCCESS: ${message}`),
};

export default logger;
