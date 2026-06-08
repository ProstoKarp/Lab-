import { NextFunction, Request, Response } from 'express';
import { EventsService } from '../services/events.service';

export class EventsController {
  constructor(private eventsService: EventsService) {}
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json({ data: await this.eventsService.createEvent(req.body) }); } catch (e) { next(e); }
  }
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const events = await this.eventsService.getAllEvents(req.query);
      res.json({ data: events, meta: { count: events.length } });
    } catch (e) { next(e); }
  }
  async getWithAuthors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const events = await this.eventsService.getEventsWithAuthors(req.query);
      res.json({ data: events, meta: { count: events.length } });
    } catch (e) { next(e); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ data: await this.eventsService.getEventById(req.params.id) }); } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ data: await this.eventsService.updateEvent(req.params.id, req.body, req.header('X-Demo-UserId')) }); } catch (e) { next(e); }
  }
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await this.eventsService.deleteEvent(req.params.id, req.header('X-Demo-UserId')); res.status(204).send(); } catch (e) { next(e); }
  }
}
