import { NextFunction, Request, Response } from 'express';
import { config } from '../../shared/config/environment';

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-api-key'];
  if (!config.apiSecretKey || key !== config.apiSecretKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
