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
    unsafeSearch(q: unknown): Promise<EventRow[]>;
    updateEvent(id: unknown, dto: UpdateEventDto): Promise<EventRow>;
    deleteEvent(id: unknown): Promise<void>;
    private validateEvent;
}
//# sourceMappingURL=events.service.d.ts.map