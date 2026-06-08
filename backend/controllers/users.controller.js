"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(req, res, next) {
        try {
            res.status(201).json({ data: await this.usersService.createUser(req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async getAll(req, res, next) {
        try {
            const users = await this.usersService.getAllUsers(String(req.query.sort || 'id'), String(req.query.order || 'ASC'), req.query.limit);
            res.json({ data: users, meta: { count: users.length } });
        }
        catch (e) {
            next(e);
        }
    }
    async getById(req, res, next) {
        try {
            res.json({ data: await this.usersService.getUserById(req.params.id) });
        }
        catch (e) {
            next(e);
        }
    }
    async update(req, res, next) {
        try {
            res.json({ data: await this.usersService.updateUser(req.params.id, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async delete(req, res, next) {
        try {
            await this.usersService.deleteUser(req.params.id);
            res.status(204).send();
        }
        catch (e) {
            next(e);
        }
    }
}
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map