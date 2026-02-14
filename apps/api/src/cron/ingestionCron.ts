import cron from 'node-cron';
import logger from '../utils/logger';
import { runIngestionCycle } from '../services/ingestion.service';

let isRunning = false;

export function startIngestionCron() {
    const enabled = process.env.INGESTION_CRON_ENABLED === 'true';
    if (!enabled) {
        logger.info('Ingestion cron disabled (set INGESTION_CRON_ENABLED=true to enable)');
        return;
    }

    const schedule = process.env.INGESTION_CRON_SCHEDULE || '*/20 * * * *';

    cron.schedule(schedule, async () => {
        if (isRunning) {
            logger.warn('Ingestion cron skipped because previous run is still in progress');
            return;
        }

        isRunning = true;
        try {
            const result = await runIngestionCycle();
            logger.info('Ingestion cron completed', result);
        } catch (error) {
            logger.error('Ingestion cron failed', error);
            const Sentry = await import('@sentry/node');
            Sentry.captureException(error);
        } finally {
            isRunning = false;
        }
    });

    logger.info('Ingestion cron scheduled successfully', { schedule });
}
