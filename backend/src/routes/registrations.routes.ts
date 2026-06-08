import { Router } from 'express';
import { RegistrationsController } from '../controllers/registrations.controller';
import { RegistrationsService } from '../services/registrations.service';
import { RegistrationsRepository } from '../repositories/registrations.repository';
import { EventsRepository } from '../repositories/events.repository';
import { UsersRepository } from '../repositories/users.repository';

const router = Router();

const registrationsRepository = new RegistrationsRepository();
const eventsRepository = new EventsRepository();
const usersRepository = new UsersRepository();

const registrationsService = new RegistrationsService(
  registrationsRepository,
  eventsRepository,
  usersRepository
);

const registrationsController = new RegistrationsController(registrationsService);

// Register user for event
router.post('/', (req, res, next) => {
  registrationsController.register(req, res, next);
});

// Get all registrations
router.get('/', (req, res, next) => {
  registrationsController.getAll(req, res, next);
});

// Get registration by ID
router.get('/:id', (req, res, next) => {
  registrationsController.getById(req, res, next);
});

// Get registrations by event ID
router.get('/event/:eventId', (req, res, next) => {
  registrationsController.getByEventId(req, res, next);
});

// Get registrations by user ID
router.get('/user/:userId', (req, res, next) => {
  registrationsController.getByUserId(req, res, next);
});

// Delete registration
router.delete('/:id', (req, res, next) => {
  registrationsController.delete(req, res, next);
});

export default router;
