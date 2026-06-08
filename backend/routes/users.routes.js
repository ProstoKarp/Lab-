"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const users_repository_1 = require("../repositories/users.repository");
const users_service_1 = require("../services/users.service");
const router = (0, express_1.Router)();
const controller = new users_controller_1.UsersController(new users_service_1.UsersService(new users_repository_1.UsersRepository()));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));
exports.default = router;
//# sourceMappingURL=users.routes.js.map