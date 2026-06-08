"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const ApiError_1 = require("../errors/ApiError");
const categories = ['announcement', 'meeting', 'workshop', 'conference'];
class EventsService {
    constructor(eventsRepository, usersRepository) {
        this.eventsRepository = eventsRepository;
        this.usersRepository = usersRepository;
    }
    async createEvent(dto) {
        this.validateEvent(dto);
        const author = await this.usersRepository.findById(dto.author_id);
        if (!author)
            throw ApiError_1.ApiError.badRequest('Author user not found');
        return this.eventsRepository.create(dto.title.trim().slice(0, 120), dto.description.trim(), dto.category, dto.author_id);
    }
    async getAllEvents(query) {
        return this.eventsRepository.findAll(query);
    }
    async getEventById(id) {
        const event = await this.eventsRepository.findById(id);
        if (!event)
            throw ApiError_1.ApiError.notFound('Event not found');
        return event;
    }
    async getEventsWithAuthors(query) {
        return this.eventsRepository.findWithAuthor(query);
    }
    async unsafeSearch(q) {
        if (typeof q !== 'string')
            throw ApiError_1.ApiError.badRequest('q is required');
        return this.eventsRepository.unsafeSearch(q);
    }
    async updateEvent(id, dto) {
        await this.getEventById(id);
        const updates = {};
        if (dto.title !== undefined) {
            if (typeof dto.title !== 'string' || dto.title.trim().length < 5)
                throw ApiError_1.ApiError.badRequest('Event title must be at least 5 characters long');
            updates.title = dto.title.trim().slice(0, 120);
        }
        if (dto.description !== undefined) {
            if (typeof dto.description !== 'string' || dto.description.trim().length < 1)
                throw ApiError_1.ApiError.badRequest('Event description cannot be empty');
            updates.description = dto.description.trim();
        }
        if (dto.category !== undefined) {
            if (!categories.includes(dto.category))
                throw ApiError_1.ApiError.badRequest(`Category must be one of: ${categories.join(', ')}`);
            updates.category = dto.category;
        }
        const updated = await this.eventsRepository.update(id, updates);
        if (!updated)
            throw ApiError_1.ApiError.notFound('Event not found');
        return updated;
    }
    async deleteEvent(id) {
        await this.getEventById(id);
        const ok = await this.eventsRepository.delete(id);
        if (!ok)
            throw ApiError_1.ApiError.notFound('Event not found');
    }
    validateEvent(dto) {
        if (!dto || typeof dto !== 'object')
            throw ApiError_1.ApiError.badRequest('Request body is required');
        if (typeof dto.title !== 'string' || dto.title.trim().length < 5)
            throw ApiError_1.ApiError.badRequest('Event title must be at least 5 characters long');
        if (typeof dto.description !== 'string' || dto.description.trim().length < 1)
            throw ApiError_1.ApiError.badRequest('Event description cannot be empty');
        if (!categories.includes(dto.category))
            throw ApiError_1.ApiError.badRequest(`Category must be one of: ${categories.join(', ')}`);
        if (!Number.isInteger(Number(dto.author_id)) || Number(dto.author_id) <= 0)
            throw ApiError_1.ApiError.badRequest('author_id must be a positive integer');
    }
}
exports.EventsService = EventsService;
//# sourceMappingURL=events.service.js.map