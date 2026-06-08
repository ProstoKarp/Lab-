"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const ApiError_1 = require("../errors/ApiError");
const sql_1 = require("../db/sql");
class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async createUser(dto) {
        this.validateName(dto.name);
        return this.usersRepository.create(dto.name.trim());
    }
    async getAllUsers(sortBy, order, limit) {
        return this.usersRepository.findAll(sortBy, order, (0, sql_1.sqlLimit)(limit, 50));
    }
    async getUserById(id) {
        const user = await this.usersRepository.findById(id);
        if (!user)
            throw ApiError_1.ApiError.notFound('User not found');
        return user;
    }
    async updateUser(id, dto) {
        await this.getUserById(id);
        const updates = {};
        if (dto.name !== undefined) {
            this.validateName(dto.name);
            updates.name = dto.name.trim();
        }
        const updated = await this.usersRepository.update(id, updates);
        if (!updated)
            throw ApiError_1.ApiError.notFound('User not found');
        return updated;
    }
    async deleteUser(id) {
        await this.getUserById(id);
        const ok = await this.usersRepository.delete(id);
        if (!ok)
            throw ApiError_1.ApiError.notFound('User not found');
    }
    validateName(name) {
        if (typeof name !== 'string' || name.trim().length < 3)
            throw ApiError_1.ApiError.badRequest('User name must be at least 3 characters long');
    }
}
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map