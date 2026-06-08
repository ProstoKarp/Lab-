import { RegistrationRow } from '../dtos/registrations.dto';
type RegistrationFilters = {
    user_id?: unknown;
    event_id?: unknown;
    status?: string;
    sort?: string;
    order?: string;
    limit?: unknown;
};
export declare class RegistrationsRepository {
    create(user_id: unknown, event_id: unknown, status?: string): Promise<RegistrationRow>;
    findAll(filters?: RegistrationFilters): Promise<RegistrationRow[]>;
    findById(id: unknown): Promise<RegistrationRow | null>;
    findOwnedById(id: unknown, ownerId: unknown): Promise<RegistrationRow | null>;
    findByEventAndUser(event_id: unknown, user_id: unknown): Promise<RegistrationRow | null>;
    updateStatus(id: unknown, status: string): Promise<RegistrationRow | null>;
    delete(id: unknown): Promise<boolean>;
    findAllWithDetails(filters?: RegistrationFilters): Promise<any[]>;
    getRegistrationStats(): Promise<any[]>;
}
export {};
//# sourceMappingURL=registrations.repository.d.ts.map