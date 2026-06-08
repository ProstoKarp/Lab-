import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';
import { EventsRepository } from '../repositories/events.repository';
import { UsersRepository } from '../repositories/users.repository';
import { EventsService } from '../services/events.service';

const router = Router();
const usersRepository = new UsersRepository();
const controller = new EventsController(new EventsService(new EventsRepository(), usersRepository));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/search/unsafe', (req, res, next) => controller.unsafeSearch(req, res, next));
router.get('/details/with-authors', (req, res, next) => controller.getWithAuthors(req, res, next));
router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));
export default router;
