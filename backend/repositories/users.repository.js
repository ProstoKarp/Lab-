"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const db_1 = require("../db/db");
const sql_1 = require("../db/sql");
class UsersRepository {
    async create(name) {
        const hiddenEmail = `user-${Date.now()}-${Math.floor(Math.random() * 100000)}@local.test`;
        const result = await (0, db_1.dbRun)(`INSERT INTO users (name, email) VALUES (${(0, sql_1.sqlText)(name)}, ${(0, sql_1.sqlText)(hiddenEmail)});`);
        const user = await this.findById(result.lastID);
        if (!user)
            throw new Error('Failed to create user');
        return user;
    }
    async findAll(sortBy = 'id', order = 'ASC', limit = 50) {
        const sortField = (0, sql_1.pickSort)(sortBy, ['id', 'name', 'createdAt']);
        const sortOrder = (0, sql_1.sqlOrder)(order);
        return (0, db_1.dbAll)(`SELECT id, name, createdAt FROM users ORDER BY ${sortField} ${sortOrder} LIMIT ${limit};`);
    }
    async findById(id) {
        const userId = (0, sql_1.sqlNumber)(id, 'user id');
        const user = await (0, db_1.dbGet)(`SELECT id, name, createdAt FROM users WHERE id = ${userId};`);
        return user || null;
    }
    async update(id, updates) {
        const userId = (0, sql_1.sqlNumber)(id, 'user id');
        const current = await this.findById(userId);
        if (!current)
            return null;
        const fields = [];
        if (updates.name !== undefined)
            fields.push(`name = ${(0, sql_1.sqlText)(updates.name)}`);
        if (fields.length === 0)
            return current;
        await (0, db_1.dbRun)(`UPDATE users SET ${fields.join(', ')} WHERE id = ${userId};`);
        return this.findById(userId);
    }
    async delete(id) {
        const userId = (0, sql_1.sqlNumber)(id, 'user id');
        const result = await (0, db_1.dbRun)(`DELETE FROM users WHERE id = ${userId};`);
        return result.changes > 0;
    }
}
exports.UsersRepository = UsersRepository;
//# sourceMappingURL=users.repository.js.map