"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsRepository = void 0;
const db_1 = require("../db/db");
const sql_1 = require("../db/sql");
class EventsRepository {
    async create(title, description, category, author_id) {
        const authorId = (0, sql_1.sqlNumber)(author_id, 'author_id');
        const result = await (0, db_1.dbRun)('INSERT INTO events (title, description, category, author_id) VALUES (?, ?, ?, ?);', [title, description, category, authorId]);
        const event = await this.findById(result.lastID);
        if (!event)
            throw new Error('Failed to create event');
        return event;
    }
    async findAll(filters = {}) {
        const sortField = (0, sql_1.pickSort)(filters.sort || 'createdAt', ['id', 'title', 'category', 'author_id', 'createdAt', 'updatedAt'], 'createdAt');
        const sortOrder = (0, sql_1.sqlOrder)(filters.order || 'DESC');
        const limit = (0, sql_1.sqlLimit)(filters.limit, 50);
        const where = [];
        const params = [];
        if (filters.category) {
            where.push('category = ?');
            params.push(filters.category);
        }
        if (filters.author_id) {
            where.push('author_id = ?');
            params.push((0, sql_1.sqlNumber)(filters.author_id, 'author_id'));
        }
        if (filters.q) {
            where.push('(title LIKE ? OR description LIKE ?)');
            params.push(`%${filters.q}%`, `%${filters.q}%`);
        }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        params.push(limit);
        return (0, db_1.dbAll)(`SELECT id, title, description, category, author_id, createdAt, updatedAt
      FROM events ${whereSql} ORDER BY ${sortField} ${sortOrder} LIMIT ?;`, params);
    }
    async findById(id) {
        const eventId = (0, sql_1.sqlNumber)(id, 'event id');
        const event = await (0, db_1.dbGet)('SELECT id, title, description, category, author_id, createdAt, updatedAt FROM events WHERE id = ?;', [eventId]);
        return event || null;
    }
    async findOwnedById(id, ownerId) {
        const eventId = (0, sql_1.sqlNumber)(id, 'event id');
        const userId = (0, sql_1.sqlNumber)(ownerId, 'current user id');
        const event = await (0, db_1.dbGet)('SELECT id, title, description, category, author_id, createdAt, updatedAt FROM events WHERE id = ? AND author_id = ?;', [eventId, userId]);
        return event || null;
    }
    async findWithAuthor(filters = {}) {
        const sortField = (0, sql_1.pickSort)(filters.sort || 'createdAt', ['id', 'title', 'category', 'createdAt', 'author_name'], 'createdAt');
        const sortOrder = (0, sql_1.sqlOrder)(filters.order || 'DESC');
        const limit = (0, sql_1.sqlLimit)(filters.limit, 50);
        const where = [];
        const params = [];
        if (filters.category) {
            where.push('e.category = ?');
            params.push(filters.category);
        }
        if (filters.author_id) {
            where.push('e.author_id = ?');
            params.push((0, sql_1.sqlNumber)(filters.author_id, 'author_id'));
        }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const sortSql = sortField === 'author_name' ? 'u.name' : `e.${sortField}`;
        params.push(limit);
        return (0, db_1.dbAll)(`SELECT e.id, e.title, e.description, e.category, e.author_id, e.createdAt, e.updatedAt,
      u.name AS author_name
      FROM events e JOIN users u ON u.id = e.author_id
      ${whereSql} ORDER BY ${sortSql} ${sortOrder} LIMIT ?;`, params);
    }
    async update(id, updates) {
        const eventId = (0, sql_1.sqlNumber)(id, 'event id');
        const current = await this.findById(eventId);
        if (!current)
            return null;
        const fields = [];
        const params = [];
        if (updates.title !== undefined) {
            fields.push('title = ?');
            params.push(updates.title);
        }
        if (updates.description !== undefined) {
            fields.push('description = ?');
            params.push(updates.description);
        }
        if (updates.category !== undefined) {
            fields.push('category = ?');
            params.push(updates.category);
        }
        if (fields.length === 0)
            return current;
        fields.push('updatedAt = CURRENT_TIMESTAMP');
        params.push(eventId);
        await (0, db_1.dbRun)(`UPDATE events SET ${fields.join(', ')} WHERE id = ?;`, params);
        return this.findById(eventId);
    }
    async delete(id) {
        const eventId = (0, sql_1.sqlNumber)(id, 'event id');
        const result = await (0, db_1.dbRun)('DELETE FROM events WHERE id = ?;', [eventId]);
        return result.changes > 0;
    }
}
exports.EventsRepository = EventsRepository;
//# sourceMappingURL=events.repository.js.map