import { EventsRepository } from '../repositories/events.repository';
import { CreateEventDto, UpdateEventDto, EventResponseDto } from '../dtos/events.dto';
import { ApiError } from '../errors/ApiError';

export class EventsService {
  constructor(private eventsRepository: EventsRepository) {}

  createEvent(dto: CreateEventDto): EventResponseDto {
    if (!dto.author || dto.author.trim().length < 3) {
      throw ApiError.badRequest('Author name must be at least 3 characters long');
    }

    if (!dto.category) {
      throw ApiError.badRequest('Category is required');
    }

    if (!dto.description || dto.description.trim().length === 0) {
      throw ApiError.badRequest('Event description cannot be empty');
    }

    if (!dto.title || dto.title.trim().length === 0) {
      throw ApiError.badRequest('Event title cannot be empty');
    }

    const event = this.eventsRepository.create(
      dto.title,
      dto.description,
      dto.category,
      dto.author
    );

    return this.mapToResponse(event);
  }

  getAllEvents(): EventResponseDto[] {
    const events = this.eventsRepository.findAll();
    return events.map((e) => this.mapToResponse(e));
  }

  getEventById(id: string): EventResponseDto {
    const event = this.eventsRepository.findById(id);
    if (!event) {
      throw ApiError.notFound('Event not found');
    }
    return this.mapToResponse(event);
  }

  updateEvent(id: string, dto: UpdateEventDto): EventResponseDto {
    const event = this.eventsRepository.findById(id);
    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    const updates: Partial<any> = {};

    if (dto.author !== undefined) {
      if (dto.author.trim().length < 3) {
        throw ApiError.badRequest('Author name must be at least 3 characters long');
      }
      updates.author = dto.author;
    }

    if (dto.category !== undefined) {
      updates.category = dto.category;
    }

    if (dto.description !== undefined) {
      if (dto.description.trim().length === 0) {
        throw ApiError.badRequest('Event description cannot be empty');
      }
      updates.description = dto.description;
    }

    if (dto.title !== undefined) {
      if (dto.title.trim().length === 0) {
        throw ApiError.badRequest('Event title cannot be empty');
      }
      updates.title = dto.title;
    }

    const updatedEvent = this.eventsRepository.update(id, updates);
    if (!updatedEvent) {
      throw ApiError.internal('Failed to update event');
    }

    return this.mapToResponse(updatedEvent);
  }

  deleteEvent(id: string): void {
    const event = this.eventsRepository.findById(id);
    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    const deleted = this.eventsRepository.delete(id);
    if (!deleted) {
      throw ApiError.internal('Failed to delete event');
    }
  }

  private mapToResponse(event: any): EventResponseDto {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      author: event.author,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
