import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError';

export class ErrorHandlerMiddleware {
  static handle(
    error: Error | ApiError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    console.error('[Error]', error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        error: {
          message: error.message,
          statusCode: error.statusCode,
          details: error.details,
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        message: 'Internal server error',
        statusCode: 500,
      },
    });
  }
}
