import { RegistrationsRepository } from '../repositories/registrations.repository';
import { EventsRepository } from '../repositories/events.repository';
import { UsersRepository } from '../repositories/users.repository';
import { CreateRegistrationDto, RegistrationResponseDto } from '../dtos/registrations.dto';
import { ApiError } from '../errors/ApiError';

export class RegistrationsService {
  constructor(
    private registrationsRepository: RegistrationsRepository,
    private eventsRepository: EventsRepository,
    private usersRepository: UsersRepository
  ) {}

  registerUserForEvent(dto: CreateRegistrationDto): RegistrationResponseDto {
    // Validate event exists
    const event = this.eventsRepository.findById(dto.eventId);
    if (!event) {
      throw ApiError.badRequest('Event not found');
    }

    // Validate user exists
    const user = this.usersRepository.findById(dto.userId);
    if (!user) {
      throw ApiError.badRequest('User not found');
    }

    // Check if already registered
    const existing = this.registrationsRepository.findByEventAndUser(
      dto.eventId,
      dto.userId
    );
    if (existing) {
      throw ApiError.conflict('User is already registered for this event');
    }

    const registration = this.registrationsRepository.create(
      dto.eventId,
      dto.userId
    );

    return this.mapToResponse(registration);
  }

  getAllRegistrations(): RegistrationResponseDto[] {
    const registrations = this.registrationsRepository.findAll();
    return registrations.map((r) => this.mapToResponse(r));
  }

  getRegistrationById(id: string): RegistrationResponseDto {
    const registration = this.registrationsRepository.findById(id);
    if (!registration) {
      throw ApiError.notFound('Registration not found');
    }
    return this.mapToResponse(registration);
  }

  getRegistrationsByEventId(eventId: string): RegistrationResponseDto[] {
    const registrations = this.registrationsRepository.findByEventId(eventId);
    return registrations.map((r) => this.mapToResponse(r));
  }

  getRegistrationsByUserId(userId: string): RegistrationResponseDto[] {
    const registrations = this.registrationsRepository.findByUserId(userId);
    return registrations.map((r) => this.mapToResponse(r));
  }

  deleteRegistration(id: string): void {
    const registration = this.registrationsRepository.findById(id);
    if (!registration) {
      throw ApiError.notFound('Registration not found');
    }

    const deleted = this.registrationsRepository.delete(id);
    if (!deleted) {
      throw ApiError.internal('Failed to delete registration');
    }
  }

  private mapToResponse(registration: any): RegistrationResponseDto {
    return {
      id: registration.id,
      eventId: registration.eventId,
      userId: registration.userId,
      registeredAt: registration.registeredAt,
    };
  }
}
