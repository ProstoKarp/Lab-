import { Request, Response, NextFunction } from 'express';
import { RegistrationsService } from '../services/registrations.service';
import { CreateRegistrationDto } from '../dtos/registrations.dto';

export class RegistrationsController {
  constructor(private registrationsService: RegistrationsService) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CreateRegistrationDto = req.body;
      const registration = this.registrationsService.registerUserForEvent(dto);
      res.status(201).json(registration);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registrations = this.registrationsService.getAllRegistrations();
      res.status(200).json(registrations);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const registration = this.registrationsService.getRegistrationById(id);
      res.status(200).json(registration);
    } catch (error) {
      next(error);
    }
  }

  async getByEventId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId } = req.params;
      const registrations = this.registrationsService.getRegistrationsByEventId(eventId);
      res.status(200).json(registrations);
    } catch (error) {
      next(error);
    }
  }

  async getByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const registrations = this.registrationsService.getRegistrationsByUserId(userId);
      res.status(200).json(registrations);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      this.registrationsService.deleteRegistration(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
