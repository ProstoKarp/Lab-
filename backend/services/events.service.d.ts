import { EventsRepository } from '../repositories/events.repository';
import { UsersRepository } from '../repositories/users.repository';
import { CreateEventDto, EventRow, UpdateEventDto } from '../dtos/events.dto';
export declare class EventsService {
    private eventsRepository;
    private usersRepository;
    constructor(eventsRepository: EventsRepository, usersRepository: UsersRepository);
    createEvent(dto: CreateEventDto): Promise<EventRow>;
    getAllEvents(query: any): Promise<EventRow[]>;
    getEventById(id: unknown): Promise<EventRow>;
    getEventsWithAuthors(query: any): Promise<any[]>;
    updateEvent(id: unknown, dto: UpdateEventDto, currentUserId?: unknown): Promise<EventRow>;
    deleteEvent(id: unknown, currentUserId?: unknown): Promise<void>;
    private assertOwner;
    private validateEvent;
}
//# sourceMappingURL=events.service.d.ts.map