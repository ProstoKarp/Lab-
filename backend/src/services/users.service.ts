import { ApiError } from '../errors/ApiError';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto, UpdateUserDto, UserRow } from '../dtos/users.dto';
import { sqlLimit } from '../db/sql';

export class UsersService {
  constructor(private usersRepository: UsersRepository) {}
  async createUser(dto: CreateUserDto): Promise<UserRow> {
    this.validateName(dto.name);
    this.validateEmail(dto.email);
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw ApiError.conflict('Email already exists');
    return this.usersRepository.create(dto.name.trim(), dto.email.trim().toLowerCase());
  }
  async getAllUsers(sortBy?: string, order?: string, limit?: unknown): Promise<UserRow[]> {
    return this.usersRepository.findAll(sortBy, order, sqlLimit(limit, 50));
  }
  async getUserById(id: unknown): Promise<UserRow> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }
  async updateUser(id: unknown, dto: UpdateUserDto): Promise<UserRow> {
    await this.getUserById(id);
    const updates: UpdateUserDto = {};
    if (dto.name !== undefined) { this.validateName(dto.name); updates.name = dto.name.trim(); }
    if (dto.email !== undefined) { this.validateEmail(dto.email); updates.email = dto.email.trim().toLowerCase(); }
    if (updates.email) {
      const existing = await this.usersRepository.findByEmail(updates.email);
      if (existing && String(existing.id) !== String(id)) throw ApiError.conflict('Email already exists');
    }
    const updated = await this.usersRepository.update(id, updates);
    if (!updated) throw ApiError.notFound('User not found');
    return updated;
  }
  async deleteUser(id: unknown): Promise<void> {
    await this.getUserById(id);
    const ok = await this.usersRepository.delete(id);
    if (!ok) throw ApiError.notFound('User not found');
  }
  private validateName(name: unknown): void {
    if (typeof name !== 'string' || name.trim().length < 3) throw ApiError.badRequest('User name must be at least 3 characters long');
  }
  private validateEmail(email: unknown): void {
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw ApiError.badRequest('Invalid email format');
  }
}
