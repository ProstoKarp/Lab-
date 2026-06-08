import { Router } from 'express';
import { RegistrationsController } from '../controllers/registrations.controller';
import { EventsRepository } from '../repositories/events.repository';
import { RegistrationsRepository } from '../repositories/registrations.repository';
import { UsersRepository } from '../repositories/users.repository';
import { RegistrationsService } from '../services/registrations.service';
import { demoAuth } from '../middleware/demo-auth.middleware';

const router = Router();
const controller = new RegistrationsController(new RegistrationsService(new RegistrationsRepository(), new EventsRepository(), new UsersRepository()));
router.post('/', demoAuth, (req, res, next) => controller.register(req, res, next));
router.get('/stats/per-event', (req, res, next) => controller.getStats(req, res, next));
router.get('/details/all', (req, res, next) => controller.getAllWithDetails(req, res, next));
router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', demoAuth, (req, res, next) => controller.getById(req, res, next));
router.put('/:id', demoAuth, (req, res, next) => controller.update(req, res, next));
router.delete('/:id', demoAuth, (req, res, next) => controller.delete(req, res, next));
export default router;
