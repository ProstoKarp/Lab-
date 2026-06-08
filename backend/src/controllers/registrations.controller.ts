import { NextFunction, Request, Response } from 'express';
import { RegistrationsService } from '../services/registrations.service';

export class RegistrationsController {
  constructor(private registrationsService: RegistrationsService) {}
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json({ data: await this.registrationsService.registerUserForEvent(req.body) }); } catch (e) { next(e); }
  }
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registrations = await this.registrationsService.getAllRegistrations(req.query);
      res.json({ data: registrations, meta: { count: registrations.length } });
    } catch (e) { next(e); }
  }
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ data: await this.registrationsService.getRegistrationById(req.params.id) }); } catch (e) { next(e); }
  }
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ data: await this.registrationsService.updateRegistration(req.params.id, req.body) }); } catch (e) { next(e); }
  }
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await this.registrationsService.deleteRegistration(req.params.id); res.status(204).send(); } catch (e) { next(e); }
  }
  async getAllWithDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registrations = await this.registrationsService.getAllRegistrationsWithDetails(req.query);
      res.json({ data: registrations, meta: { count: registrations.length } });
    } catch (e) { next(e); }
  }
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.registrationsService.getRegistrationStats();
      res.json({ data: stats, meta: { count: stats.length } });
    } catch (e) { next(e); }
  }
}
