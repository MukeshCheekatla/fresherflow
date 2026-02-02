import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
    namespace Express {
        interface Request {
            requestId: string;
        }
    }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
    req.requestId = randomUUID();
    res.setHeader('X-Request-ID', req.requestId);
    next();
}
