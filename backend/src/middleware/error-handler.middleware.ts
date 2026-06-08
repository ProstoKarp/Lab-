import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors/ApiError';

export class ErrorHandlerMiddleware {
  static handle(error: unknown, req: Request, res: Response, next: NextFunction): void {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Error]', error);
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: { message: error.message, statusCode: error.statusCode, details: error.details || null } });
      return;
    }
    if (msg.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: { message: 'Unique constraint violation', statusCode: 409, details: msg } });
      return;
    }
    if (msg.includes('CHECK constraint failed') || msg.includes('NOT NULL constraint failed') || msg.includes('FOREIGN KEY constraint failed') || msg.includes('must be')) {
      res.status(400).json({ error: { message: 'Invalid data', statusCode: 400, details: msg } });
      return;
    }
    res.status(500).json({ error: { message: 'Internal server error', statusCode: 500 } });
  }
}
