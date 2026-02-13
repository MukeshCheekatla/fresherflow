import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/**
 * CSRF Protection Middleware
 * 
 * In modern SPAs where the API is hosted on the same domain (or verified via CORS),
 * checking for a custom request header is an effective defense against CSRF.
 * 
 * Browsers prevent cross-origin requests from setting custom headers unless explicitly 
 * permitted by the server's CORS policy. Our CORS policy does NOT allow 'X-Requested-From'
 * from unauthorized origins.
 */
export function csrfGate(req: Request, res: Response, next: NextFunction) {
    // 1. Skip GET, HEAD, OPTIONS (Safe methods)
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
        return next();
    }

    // 2. Enforce custom header
    const requestedFrom = req.header('X-Requested-From');
    const expectedValue = 'fresherflow-web';

    if (!requestedFrom || requestedFrom !== expectedValue) {
        return next(new AppError('CSRF Security Violation: Request must originate from the verified web application.', 403));
    }

    next();
}
