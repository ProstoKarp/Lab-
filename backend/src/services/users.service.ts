import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/users.dto';
import { ApiError } from '../errors/ApiError';

export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  createUser(dto: CreateUserDto): UserResponseDto {
    if (!dto.name || dto.name.trim().length < 3) {
      throw ApiError.badRequest('User name must be at least 3 characters long');
    }

    if (!dto.email || !this.isValidEmail(dto.email)) {
      throw ApiError.badRequest('Invalid email format');
    }

    const user = this.usersRepository.create(dto.name, dto.email);
    return this.mapToResponse(user);
  }

  getAllUsers(): UserResponseDto[] {
    const users = this.usersRepository.findAll();
    return users.map((u) => this.mapToResponse(u));
  }

  getUserById(id: string): UserResponseDto {
    const user = this.usersRepository.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return this.mapToResponse(user);
  }

  updateUser(id: string, dto: UpdateUserDto): UserResponseDto {
    const user = this.usersRepository.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updates: Partial<any> = {};

    if (dto.name !== undefined) {
      if (dto.name.trim().length < 3) {
        throw ApiError.badRequest('User name must be at least 3 characters long');
      }
      updates.name = dto.name;
    }

    if (dto.email !== undefined) {
      if (!this.isValidEmail(dto.email)) {
        throw ApiError.badRequest('Invalid email format');
      }
      updates.email = dto.email;
    }

    const updatedUser = this.usersRepository.update(id, updates);
    if (!updatedUser) {
      throw ApiError.internal('Failed to update user');
    }

    return this.mapToResponse(updatedUser);
  }

  deleteUser(id: string): void {
    const user = this.usersRepository.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const deleted = this.usersRepository.delete(id);
    if (!deleted) {
      throw ApiError.internal('Failed to delete user');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private mapToResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
