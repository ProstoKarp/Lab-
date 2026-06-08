import { NextFunction, Request, Response } from 'express';
import { EventsService } from '../services/events.service';
export declare class EventsController {
    private eventsService;
    constructor(eventsService: EventsService);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getWithAuthors(req: Request, res: Response, next: NextFunction): Promise<void>;
    unsafeSearch(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=events.controller.d.ts.map