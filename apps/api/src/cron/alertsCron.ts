import cron from 'node-cron';
import logger from '../utils/logger';
import { runAlertsCycle } from '../services/alerts.service';

let isRunning = false;

export function startAlertsCron() {
    const enabled = process.env.ALERTS_CRON_ENABLED !== 'false';
    if (!enabled) {
        logger.info('Alerts cron disabled via ALERTS_CRON_ENABLED=false');
        return;
    }

    const schedule = process.env.ALERTS_CRON_SCHEDULE || '*/30 * * * *';

    cron.schedule(schedule, async () => {
        if (isRunning) {
            logger.warn('Alerts cron skipped because previous run is still in progress');
            return;
        }

        isRunning = true;
        try {
            const result = await runAlertsCycle();
            logger.info('Alerts cron completed', result);
        } catch (error) {
            logger.error('Alerts cron failed', error);
        } finally {
            isRunning = false;
        }
    });

    logger.info('Alerts cron scheduled successfully', { schedule });
}
