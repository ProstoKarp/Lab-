import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors/ApiError';

export class ErrorHandlerMiddleware {
  static handle(error: unknown, req: Request, res: Response, next: NextFunction): void {
    const msg = error instanceof Error ? error.message : String(error);
    const isDev = process.env.NODE_ENV !== 'production';
    console.error('[Error]', error);
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
          details: isDev ? (error.details ?? null) : null
        }
      });
      return;
    }
    if (msg.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: { code: 'CONFLICT', message: 'Unique constraint violation', statusCode: 409, details: isDev ? msg : null } });
      return;
    }
    if (msg.includes('CHECK constraint failed') || msg.includes('NOT NULL constraint failed') || msg.includes('FOREIGN KEY constraint failed') || msg.includes('must be')) {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Invalid data', statusCode: 400, details: isDev ? msg : null } });
      return;
    }
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error', statusCode: 500, details: isDev ? msg : null } });
  }
}
