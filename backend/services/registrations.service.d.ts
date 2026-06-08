import { EventsRepository } from '../repositories/events.repository';
import { RegistrationsRepository } from '../repositories/registrations.repository';
import { UsersRepository } from '../repositories/users.repository';
import { CreateRegistrationDto, RegistrationRow, UpdateRegistrationDto } from '../dtos/registrations.dto';
export declare class RegistrationsService {
    private registrationsRepository;
    private eventsRepository;
    private usersRepository;
    constructor(registrationsRepository: RegistrationsRepository, eventsRepository: EventsRepository, usersRepository: UsersRepository);
    registerUserForEvent(dto: CreateRegistrationDto): Promise<RegistrationRow>;
    getAllRegistrations(query: any): Promise<RegistrationRow[]>;
    getRegistrationById(id: unknown): Promise<RegistrationRow>;
    updateRegistration(id: unknown, dto: UpdateRegistrationDto): Promise<RegistrationRow>;
    deleteRegistration(id: unknown): Promise<void>;
    getAllRegistrationsWithDetails(query: any): Promise<any[]>;
    getRegistrationStats(): Promise<any[]>;
    private validateRegistration;
}
//# sourceMappingURL=registrations.service.d.ts.map