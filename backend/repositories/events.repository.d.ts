import { EventRow } from '../dtos/events.dto';
type EventFilters = {
    category?: string;
    author_id?: unknown;
    q?: string;
    sort?: string;
    order?: string;
    limit?: unknown;
};
export declare class EventsRepository {
    create(title: string, description: string, category: string, author_id: unknown): Promise<EventRow>;
    findAll(filters?: EventFilters): Promise<EventRow[]>;
    findById(id: unknown): Promise<EventRow | null>;
    findWithAuthor(filters?: EventFilters): Promise<any[]>;
    unsafeSearch(q: string): Promise<EventRow[]>;
    update(id: unknown, updates: Partial<{
        title: string;
        description: string;
        category: string;
    }>): Promise<EventRow | null>;
    delete(id: unknown): Promise<boolean>;
}
export {};
//# sourceMappingURL=events.repository.d.ts.map