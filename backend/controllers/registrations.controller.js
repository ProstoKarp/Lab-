"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationsController = void 0;
class RegistrationsController {
    constructor(registrationsService) {
        this.registrationsService = registrationsService;
    }
    async register(req, res, next) {
        try {
            res.status(201).json({ data: await this.registrationsService.registerUserForEvent(req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async getAll(req, res, next) {
        try {
            const registrations = await this.registrationsService.getAllRegistrations(req.query);
            res.json({ data: registrations, meta: { count: registrations.length } });
        }
        catch (e) {
            next(e);
        }
    }
    async getById(req, res, next) {
        try {
            res.json({ data: await this.registrationsService.getRegistrationById(req.params.id) });
        }
        catch (e) {
            next(e);
        }
    }
    async update(req, res, next) {
        try {
            res.json({ data: await this.registrationsService.updateRegistration(req.params.id, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async delete(req, res, next) {
        try {
            await this.registrationsService.deleteRegistration(req.params.id);
            res.status(204).send();
        }
        catch (e) {
            next(e);
        }
    }
    async getAllWithDetails(req, res, next) {
        try {
            const registrations = await this.registrationsService.getAllRegistrationsWithDetails(req.query);
            res.json({ data: registrations, meta: { count: registrations.length } });
        }
        catch (e) {
            next(e);
        }
    }
    async getStats(req, res, next) {
        try {
            const stats = await this.registrationsService.getRegistrationStats();
            res.json({ data: stats, meta: { count: stats.length } });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.RegistrationsController = RegistrationsController;
//# sourceMappingURL=registrations.controller.js.map