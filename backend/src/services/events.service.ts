import { ApiError } from '../errors/ApiError';
import { EventsRepository } from '../repositories/events.repository';
import { UsersRepository } from '../repositories/users.repository';
import { CreateEventDto, EventCategory, EventRow, UpdateEventDto } from '../dtos/events.dto';

const categories: EventCategory[] = ['announcement', 'meeting', 'workshop', 'conference'];

export class EventsService {
  constructor(private eventsRepository: EventsRepository, private usersRepository: UsersRepository) {}
  async createEvent(dto: CreateEventDto): Promise<EventRow> {
    this.validateEvent(dto);
    const author = await this.usersRepository.findById(dto.author_id);
    if (!author) throw ApiError.badRequest('Author user not found');
    return this.eventsRepository.create(dto.title.trim().slice(0, 120), dto.description.trim(), dto.category, dto.author_id);
  }
  async getAllEvents(query: any): Promise<EventRow[]> {
    return this.eventsRepository.findAll(query);
  }
  async getEventById(id: unknown): Promise<EventRow> {
    const event = await this.eventsRepository.findById(id);
    if (!event) throw ApiError.notFound('Event not found');
    return event;
  }
  async getEventsWithAuthors(query: any): Promise<any[]> {
    return this.eventsRepository.findWithAuthor(query);
  }
  async unsafeSearch(q: unknown): Promise<EventRow[]> {
    if (typeof q !== 'string') throw ApiError.badRequest('q is required');
    return this.eventsRepository.unsafeSearch(q);
  }
  async updateEvent(id: unknown, dto: UpdateEventDto): Promise<EventRow> {
    await this.getEventById(id);
    const updates: UpdateEventDto = {};
    if (dto.title !== undefined) {
      if (typeof dto.title !== 'string' || dto.title.trim().length < 5) throw ApiError.badRequest('Event title must be at least 5 characters long');
      updates.title = dto.title.trim().slice(0, 120);
    }
    if (dto.description !== undefined) {
      if (typeof dto.description !== 'string' || dto.description.trim().length < 1) throw ApiError.badRequest('Event description cannot be empty');
      updates.description = dto.description.trim();
    }
    if (dto.category !== undefined) {
      if (!categories.includes(dto.category)) throw ApiError.badRequest(`Category must be one of: ${categories.join(', ')}`);
      updates.category = dto.category;
    }
    const updated = await this.eventsRepository.update(id, updates);
    if (!updated) throw ApiError.notFound('Event not found');
    return updated;
  }
  async deleteEvent(id: unknown): Promise<void> {
    await this.getEventById(id);
    const ok = await this.eventsRepository.delete(id);
    if (!ok) throw ApiError.notFound('Event not found');
  }
  private validateEvent(dto: CreateEventDto): void {
    if (!dto || typeof dto !== 'object') throw ApiError.badRequest('Request body is required');
    if (typeof dto.title !== 'string' || dto.title.trim().length < 5) throw ApiError.badRequest('Event title must be at least 5 characters long');
    if (typeof dto.description !== 'string' || dto.description.trim().length < 1) throw ApiError.badRequest('Event description cannot be empty');
    if (!categories.includes(dto.category)) throw ApiError.badRequest(`Category must be one of: ${categories.join(', ')}`);
    if (!Number.isInteger(Number(dto.author_id)) || Number(dto.author_id) <= 0) throw ApiError.badRequest('author_id must be a positive integer');
  }
}
