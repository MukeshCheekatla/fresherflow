import express, { Request, Response } from 'express';
import { recordGrowthEvent } from '../../services/growthFunnel.service';

const router = express.Router();

// Lightweight public tracking endpoint for growth funnel events.
router.post('/event', async (req: Request, res: Response) => {
    const { source, event } = req.body || {};
    await recordGrowthEvent(source, event);
    res.status(202).json({ ok: true });
});

export default router;
