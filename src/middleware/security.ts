import { getApiKey, isValidApiKey } from '../utils/keyManager';
import { ALLOWED_IPS } from '../config/constants';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';


export function dynamicApiKeyMiddleware(req: Request, res: Response, next: NextFunction) {

    const providedKey = req.headers['x-api-key'];

    if (typeof providedKey !== 'string' || !isValidApiKey(providedKey)) {
        res.status(401).json({ error: 'Invalid API key' });
        return;
    }

    next();
}


export function ipRestrictionMiddleware(req: Request, res: Response, next: NextFunction) {
    const rawIp = req.ip ?? req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '';
    const ip = rawIp.toString().replace('::ffff:', '');

    if (!ALLOWED_IPS.includes(ip)) {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }

    next();
}

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});
