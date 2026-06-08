import { Request, Response, NextFunction } from 'express';

export class LoggerMiddleware {
  static log(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const originalSend = res.send;

    res.send = function (data: any): Response {
      const duration = Date.now() - start;
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
      );
      return originalSend.call(this, data);
    };

    next();
  }
}
