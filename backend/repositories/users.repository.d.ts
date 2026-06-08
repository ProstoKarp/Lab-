import { UserRow } from '../dtos/users.dto';
export declare class UsersRepository {
    create(name: string): Promise<UserRow>;
    findAll(sortBy?: string, order?: string, limit?: unknown): Promise<UserRow[]>;
    findById(id: unknown): Promise<UserRow | null>;
    update(id: unknown, updates: Partial<{
        name: string;
    }>): Promise<UserRow | null>;
    delete(id: unknown): Promise<boolean>;
}
//# sourceMappingURL=users.repository.d.ts.map