import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';
import { EventsService } from '../services/events.service';
import { EventsRepository } from '../repositories/events.repository';
import { ValidationMiddleware } from '../middleware/validation.middleware';

const router = Router();

const eventsRepository = new EventsRepository();
const eventsService = new EventsService(eventsRepository);
const eventsController = new EventsController(eventsService);

// Create event
router.post('/', (req, res, next) => {
  ValidationMiddleware.validateEventInput(req, res, () => {
    eventsController.create(req, res, next);
  });
});

// Get all events
router.get('/', (req, res, next) => {
  eventsController.getAll(req, res, next);
});

// Get event by ID
router.get('/:id', (req, res, next) => {
  eventsController.getById(req, res, next);
});

// Update event
router.put('/:id', (req, res, next) => {
  eventsController.update(req, res, next);
});

// Delete event
router.delete('/:id', (req, res, next) => {
  eventsController.delete(req, res, next);
});

export default router;
