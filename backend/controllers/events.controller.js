"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const demo_auth_middleware_1 = require("../middleware/demo-auth.middleware");
class EventsController {
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    async create(req, res, next) {
        try {
            res.status(201).json({ data: await this.eventsService.createEvent(req.body, (0, demo_auth_middleware_1.currentUserId)(req)) });
        }
        catch (e) {
            next(e);
        }
    }
    async getAll(req, res, next) {
        try {
            const events = await this.eventsService.getAllEvents(req.query);
            res.json({ data: events, meta: { count: events.length } });
        }
        catch (e) {
            next(e);
        }
    }
    async getWithAuthors(req, res, next) {
        try {
            const events = await this.eventsService.getEventsWithAuthors(req.query);
            res.json({ data: events, meta: { count: events.length } });
        }
        catch (e) {
            next(e);
        }
    }
    async getById(req, res, next) {
        try {
            res.json({ data: await this.eventsService.getEventById(req.params.id, (0, demo_auth_middleware_1.currentUserId)(req)) });
        }
        catch (e) {
            next(e);
        }
    }
    async update(req, res, next) {
        try {
            res.json({ data: await this.eventsService.updateEvent(req.params.id, req.body, (0, demo_auth_middleware_1.currentUserId)(req)) });
        }
        catch (e) {
            next(e);
        }
    }
    async delete(req, res, next) {
        try {
            await this.eventsService.deleteEvent(req.params.id, (0, demo_auth_middleware_1.currentUserId)(req));
            res.status(204).send();
        }
        catch (e) {
            next(e);
        }
    }
}
exports.EventsController = EventsController;
//# sourceMappingURL=events.controller.js.map