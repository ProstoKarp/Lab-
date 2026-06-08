import { ApiError } from '../errors/ApiError';
import { EventsRepository } from '../repositories/events.repository';
import { RegistrationsRepository } from '../repositories/registrations.repository';
import { UsersRepository } from '../repositories/users.repository';
import { CreateRegistrationDto, RegistrationRow, RegistrationStatus, UpdateRegistrationDto } from '../dtos/registrations.dto';

const statuses: RegistrationStatus[] = ['registered', 'attended', 'cancelled'];

export class RegistrationsService {
  constructor(
    private registrationsRepository: RegistrationsRepository,
    private eventsRepository: EventsRepository,
    private usersRepository: UsersRepository,
  ) {}
  async registerUserForEvent(dto: CreateRegistrationDto, currentUserId?: unknown): Promise<RegistrationRow> {
    this.validateRegistration(dto);
    this.assertCurrentUser(dto.user_id, currentUserId, 'register');
    const event = await this.eventsRepository.findById(dto.event_id);
    if (!event) throw ApiError.badRequest('Event not found');
    const user = await this.usersRepository.findById(dto.user_id);
    if (!user) throw ApiError.badRequest('User not found');
    const existing = await this.registrationsRepository.findByEventAndUser(dto.event_id, dto.user_id);
    if (existing) throw ApiError.conflict('User is already registered for this event');
    return this.registrationsRepository.create(dto.user_id, dto.event_id, dto.status || 'registered');
  }
  async getAllRegistrations(query: any): Promise<RegistrationRow[]> {
    return this.registrationsRepository.findAll(query);
  }
  async getRegistrationById(id: unknown, currentUserId?: unknown): Promise<RegistrationRow> {
    const registration = await this.registrationsRepository.findById(id);
    if (!registration) throw ApiError.notFound('Registration not found');
    if (currentUserId !== undefined) this.assertCurrentUser(registration.user_id, currentUserId, 'read');
    return registration;
  }
  async updateRegistration(id: unknown, dto: UpdateRegistrationDto, currentUserId?: unknown): Promise<RegistrationRow> {
    const current = await this.getRegistrationById(id);
    this.assertCurrentUser(current.user_id, currentUserId, 'update');
    if (dto.status !== undefined && !statuses.includes(dto.status)) {
      throw ApiError.badRequest(`Status must be one of: ${statuses.join(', ')}`);
    }
    const updated = dto.status ? await this.registrationsRepository.updateStatus(id, dto.status) : await this.registrationsRepository.findById(id);
    if (!updated) throw ApiError.notFound('Registration not found');
    return updated;
  }
  async deleteRegistration(id: unknown, currentUserId?: unknown): Promise<void> {
    const current = await this.getRegistrationById(id);
    this.assertCurrentUser(current.user_id, currentUserId, 'delete');
    const ok = await this.registrationsRepository.delete(id);
    if (!ok) throw ApiError.notFound('Registration not found');
  }
  async getAllRegistrationsWithDetails(query: any): Promise<any[]> {
    return this.registrationsRepository.findAllWithDetails(query);
  }
  async getRegistrationStats(): Promise<any[]> {
    return this.registrationsRepository.getRegistrationStats();
  }
  private validateRegistration(dto: CreateRegistrationDto): void {
    if (!Number.isInteger(Number(dto.user_id)) || Number(dto.user_id) <= 0) throw ApiError.badRequest('user_id must be a positive integer');
    if (!Number.isInteger(Number(dto.event_id)) || Number(dto.event_id) <= 0) throw ApiError.badRequest('event_id must be a positive integer');
    if (dto.status !== undefined && !statuses.includes(dto.status)) throw ApiError.badRequest(`Status must be one of: ${statuses.join(', ')}`);
  }
  private assertCurrentUser(userId: unknown, currentUserId: unknown, action: string): void {
    if (!Number.isInteger(Number(currentUserId)) || Number(currentUserId) <= 0) {
      throw ApiError.unauthorized('X-Demo-UserId header is required for registration actions');
    }
    if (Number(currentUserId) !== Number(userId)) {
      throw ApiError.forbidden(`You can ${action} only your own registrations`);
    }
  }
}
