import { Request, Response } from 'express';
export class HealthController {
  check(req: Request, res: Response): void {
    res.json({ data: { status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() }, meta: { service: 'Board Application API', version: '0.3.0' } });
  }
}
