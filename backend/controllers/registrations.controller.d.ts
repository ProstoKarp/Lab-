import { NextFunction, Request, Response } from 'express';
import { RegistrationsService } from '../services/registrations.service';
export declare class RegistrationsController {
    private registrationsService;
    constructor(registrationsService: RegistrationsService);
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllWithDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=registrations.controller.d.ts.map