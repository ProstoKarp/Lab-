"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const events_controller_1 = require("../controllers/events.controller");
const events_repository_1 = require("../repositories/events.repository");
const users_repository_1 = require("../repositories/users.repository");
const events_service_1 = require("../services/events.service");
const demo_auth_middleware_1 = require("../middleware/demo-auth.middleware");
const router = (0, express_1.Router)();
const usersRepository = new users_repository_1.UsersRepository();
const controller = new events_controller_1.EventsController(new events_service_1.EventsService(new events_repository_1.EventsRepository(), usersRepository));
router.post('/', demo_auth_middleware_1.demoAuth, (req, res, next) => controller.create(req, res, next));
router.get('/details/with-authors', (req, res, next) => controller.getWithAuthors(req, res, next));
router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', demo_auth_middleware_1.demoAuth, (req, res, next) => controller.getById(req, res, next));
router.put('/:id', demo_auth_middleware_1.demoAuth, (req, res, next) => controller.update(req, res, next));
router.delete('/:id', demo_auth_middleware_1.demoAuth, (req, res, next) => controller.delete(req, res, next));
exports.default = router;
//# sourceMappingURL=events.routes.js.map