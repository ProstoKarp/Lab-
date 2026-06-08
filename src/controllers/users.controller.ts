import { NextFunction, Request, Response } from 'express';
import { UsersService } from '../services/users.service';

export class UsersController {
  constructor(private usersService: UsersService) {}
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json({ data: await this.usersService.createUser(req.body) }); } catch (e) { next(e); }
  }
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.usersService.getAllUsers(String(req.query.sort || 'id'), String(req.query.order || 'ASC'), req.query.limit);
      res.json({ data: users, meta: { count: users.length } });
    } catch (e) { next(e); }
  }
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ data: await this.usersService.getUserById(req.params.id) }); } catch (e) { next(e); }
  }
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ data: await this.usersService.updateUser(req.params.id, req.body) }); } catch (e) { next(e); }
  }
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await this.usersService.deleteUser(req.params.id); res.status(204).send(); } catch (e) { next(e); }
  }
}
