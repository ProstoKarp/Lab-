import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors/ApiError';
import { UsersRepository } from '../repositories/users.repository';

const usersRepository = new UsersRepository();

export async function demoAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const raw = req.header('X-Demo-UserId');
    if (!raw) throw ApiError.unauthorized('X-Demo-UserId header is required');
    const userId = Number(raw);
    if (!Number.isInteger(userId) || userId <= 0) throw ApiError.unauthorized('X-Demo-UserId must be a positive integer');
    const user = await usersRepository.findById(userId);
    if (!user) throw ApiError.unauthorized('Demo user not found');
    (req as Request & { currentUserId?: number }).currentUserId = userId;
    next();
  } catch (e) {
    next(e);
  }
}

export function currentUserId(req: Request): number | undefined {
  return (req as Request & { currentUserId?: number }).currentUserId;
}
