import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';
import { UsersRepository } from '../repositories/users.repository';
import { ValidationMiddleware } from '../middleware/validation.middleware';

const router = Router();

const usersRepository = new UsersRepository();
const usersService = new UsersService(usersRepository);
const usersController = new UsersController(usersService);

// Create user
router.post('/', (req, res, next) => {
  ValidationMiddleware.validateUserInput(req, res, () => {
    usersController.create(req, res, next);
  });
});

// Get all users
router.get('/', (req, res, next) => {
  usersController.getAll(req, res, next);
});

// Get user by ID
router.get('/:id', (req, res, next) => {
  usersController.getById(req, res, next);
});

// Update user
router.put('/:id', (req, res, next) => {
  usersController.update(req, res, next);
});

// Delete user
router.delete('/:id', (req, res, next) => {
  usersController.delete(req, res, next);
});

export default router;
