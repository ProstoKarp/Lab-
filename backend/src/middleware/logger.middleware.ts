import { NextFunction, Request, Response } from 'express';
export class LoggerMiddleware {
  static log(req: Request, res: Response, next: NextFunction): void {
    const started = Date.now();
    res.on('finish', () => console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${Date.now() - started}ms)`));
    next();
  }
}
