import winston from 'winston';
import chalk from 'chalk';

// Custom format with Chalk for vibrant colors
const consoleFormat = winston.format.printf(({ level, message, timestamp, requestId, ...meta }) => {
    const time = chalk.gray(new Date(timestamp as string).toLocaleTimeString());
    const reqId = (requestId && typeof requestId === 'string')
        ? chalk.gray(`[${requestId.substring(0, 8)}]`)
        : '';

    // Vibrant color-coded symbols and levels
    let prefix = '';
    let coloredMessage = message;

    if (level.includes('info')) {
        prefix = chalk.blue('●');
        coloredMessage = chalk.white(message);
    } else if (level.includes('warn')) {
        prefix = chalk.yellow('⚠');
        coloredMessage = chalk.yellow(message);
    } else if (level.includes('error')) {
        prefix = chalk.red('✖');
        coloredMessage = chalk.red(message);
    } else if (level.includes('debug')) {
        prefix = chalk.cyan('○');
        coloredMessage = chalk.cyan(message);
    } else {
        prefix = chalk.gray('○');
    }

    // Add metadata for errors
    const metaStr = level.includes('error') && Object.keys(meta).length
        ? chalk.dim(JSON.stringify(meta))
        : '';

    return `${time} ${prefix} ${coloredMessage} ${reqId} ${metaStr}`;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true })
    ),
    defaultMeta: { service: 'fresherflow-api' },
    transports: [
        new winston.transports.Console({
            format: consoleFormat
        })
    ]
});

// Helper methods
export const log = {
    info: (message: string, meta?: any) => logger.info(message, meta),
    warn: (message: string, meta?: any) => logger.warn(message, meta),
    error: (message: string, meta?: any) => logger.error(message, meta),
    debug: (message: string, meta?: any) => logger.debug(message, meta),
    success: (message: string) => logger.info(chalk.green(`✅ ${message}`)),
};

export default logger;
