import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto, UpdateUserDto, UserRow } from '../dtos/users.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: UsersRepository);
    createUser(dto: CreateUserDto): Promise<UserRow>;
    getAllUsers(sortBy?: string, order?: string, limit?: unknown): Promise<UserRow[]>;
    getUserById(id: unknown): Promise<UserRow>;
    updateUser(id: unknown, dto: UpdateUserDto): Promise<UserRow>;
    deleteUser(id: unknown): Promise<void>;
    private validateName;
}
//# sourceMappingURL=users.service.d.ts.map