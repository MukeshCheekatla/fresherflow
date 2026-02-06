import express, { Request, Response } from 'express';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Lightweight health check for uptime monitoring
 * @access  Public
 */
router.get('/health', (req: Request, res: Response) => {
    // Return immediately without DB or Auth checks
    res.status(200).send('ok');
});

export default router;
