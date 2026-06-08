import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError';

export class ValidationMiddleware {
  static validateEventInput(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { title, description, category, author } = req.body;

    const errors: Record<string, string> = {};

    if (!author || author.trim().length < 3) {
      errors.author = 'Author name must be at least 3 characters';
    }

    if (!category) {
      errors.category = 'Category is required';
    }

    if (!description || description.trim().length === 0) {
      errors.description = 'Description cannot be empty';
    }

    if (!title || title.trim().length === 0) {
      errors.title = 'Title cannot be empty';
    }

    if (Object.keys(errors).length > 0) {
      throw ApiError.badRequest('Validation failed', errors);
    }

    next();
  }

  static validateUserInput(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { name, email } = req.body;

    const errors: Record<string, string> = {};

    if (!name || name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

    if (!email || !this.isValidEmail(email)) {
      errors.email = 'Invalid email format';
    }

    if (Object.keys(errors).length > 0) {
      throw ApiError.badRequest('Validation failed', errors);
    }

    next();
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
