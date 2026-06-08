import { NextFunction, Request, Response } from 'express';
import { UsersService } from '../services/users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=users.controller.d.ts.map