import { Request, Response, NextFunction } from 'express';
import { EventsService } from '../services/events.service';
import { CreateEventDto, UpdateEventDto } from '../dtos/events.dto';

export class EventsController {
  constructor(private eventsService: EventsService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CreateEventDto = req.body;
      const event = this.eventsService.createEvent(dto);
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const events = this.eventsService.getAllEvents();
      res.status(200).json(events);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const event = this.eventsService.getEventById(id);
      res.status(200).json(event);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto: UpdateEventDto = req.body;
      const event = this.eventsService.updateEvent(id, dto);
      res.status(200).json(event);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      this.eventsService.deleteEvent(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
