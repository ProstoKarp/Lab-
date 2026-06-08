"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationsService = void 0;
const ApiError_1 = require("../errors/ApiError");
const statuses = ['registered', 'attended', 'cancelled'];
class RegistrationsService {
    constructor(registrationsRepository, eventsRepository, usersRepository) {
        this.registrationsRepository = registrationsRepository;
        this.eventsRepository = eventsRepository;
        this.usersRepository = usersRepository;
    }
    async registerUserForEvent(dto, currentUserId) {
        this.validateRegistration(dto);
        this.assertCurrentUser(dto.user_id, currentUserId, 'register');
        const event = await this.eventsRepository.findById(dto.event_id);
        if (!event)
            throw ApiError_1.ApiError.badRequest('Event not found');
        const user = await this.usersRepository.findById(dto.user_id);
        if (!user)
            throw ApiError_1.ApiError.badRequest('User not found');
        const existing = await this.registrationsRepository.findByEventAndUser(dto.event_id, dto.user_id);
        if (existing)
            throw ApiError_1.ApiError.conflict('User is already registered for this event');
        return this.registrationsRepository.create(dto.user_id, dto.event_id, dto.status || 'registered');
    }
    async getAllRegistrations(query) {
        return this.registrationsRepository.findAll(query);
    }
    async getRegistrationById(id) {
        const registration = await this.registrationsRepository.findById(id);
        if (!registration)
            throw ApiError_1.ApiError.notFound('Registration not found');
        return registration;
    }
    async updateRegistration(id, dto, currentUserId) {
        const current = await this.getRegistrationById(id);
        this.assertCurrentUser(current.user_id, currentUserId, 'update');
        if (dto.status !== undefined && !statuses.includes(dto.status)) {
            throw ApiError_1.ApiError.badRequest(`Status must be one of: ${statuses.join(', ')}`);
        }
        const updated = dto.status ? await this.registrationsRepository.updateStatus(id, dto.status) : await this.registrationsRepository.findById(id);
        if (!updated)
            throw ApiError_1.ApiError.notFound('Registration not found');
        return updated;
    }
    async deleteRegistration(id, currentUserId) {
        const current = await this.getRegistrationById(id);
        this.assertCurrentUser(current.user_id, currentUserId, 'delete');
        const ok = await this.registrationsRepository.delete(id);
        if (!ok)
            throw ApiError_1.ApiError.notFound('Registration not found');
    }
    async getAllRegistrationsWithDetails(query) {
        return this.registrationsRepository.findAllWithDetails(query);
    }
    async getRegistrationStats() {
        return this.registrationsRepository.getRegistrationStats();
    }
    validateRegistration(dto) {
        if (!Number.isInteger(Number(dto.user_id)) || Number(dto.user_id) <= 0)
            throw ApiError_1.ApiError.badRequest('user_id must be a positive integer');
        if (!Number.isInteger(Number(dto.event_id)) || Number(dto.event_id) <= 0)
            throw ApiError_1.ApiError.badRequest('event_id must be a positive integer');
        if (dto.status !== undefined && !statuses.includes(dto.status))
            throw ApiError_1.ApiError.badRequest(`Status must be one of: ${statuses.join(', ')}`);
    }
    assertCurrentUser(userId, currentUserId, action) {
        if (!Number.isInteger(Number(currentUserId)) || Number(currentUserId) <= 0) {
            throw ApiError_1.ApiError.badRequest('X-Demo-UserId header is required for registration actions');
        }
        if (Number(currentUserId) !== Number(userId)) {
            throw ApiError_1.ApiError.forbidden(`You can ${action} only your own registrations`);
        }
    }
}
exports.RegistrationsService = RegistrationsService;
//# sourceMappingURL=registrations.service.js.map