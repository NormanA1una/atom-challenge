import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { ValidationError } from '../../domain/errors/validation.error';

export function errorHandlerMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }
  console.error('[Unhandled error]', err);
  res.status(500).json({ error: 'Internal server error' });
}
