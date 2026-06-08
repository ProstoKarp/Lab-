"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationsRepository = void 0;
const db_1 = require("../db/db");
const sql_1 = require("../db/sql");
class RegistrationsRepository {
    async create(user_id, event_id, status = 'registered') {
        const userId = (0, sql_1.sqlNumber)(user_id, 'user_id');
        const eventId = (0, sql_1.sqlNumber)(event_id, 'event_id');
        const result = await (0, db_1.dbRun)('INSERT INTO registrations (user_id, event_id, status) VALUES (?, ?, ?);', [userId, eventId, status]);
        const registration = await this.findById(result.lastID);
        if (!registration)
            throw new Error('Failed to create registration');
        return registration;
    }
    async findAll(filters = {}) {
        const sortField = (0, sql_1.pickSort)(filters.sort || 'createdAt', ['id', 'user_id', 'event_id', 'status', 'createdAt'], 'createdAt');
        const sortOrder = (0, sql_1.sqlOrder)(filters.order || 'DESC');
        const limit = (0, sql_1.sqlLimit)(filters.limit, 50);
        const where = [];
        const params = [];
        if (filters.user_id) {
            where.push('user_id = ?');
            params.push((0, sql_1.sqlNumber)(filters.user_id, 'user_id'));
        }
        if (filters.event_id) {
            where.push('event_id = ?');
            params.push((0, sql_1.sqlNumber)(filters.event_id, 'event_id'));
        }
        if (filters.status) {
            where.push('status = ?');
            params.push(filters.status);
        }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        params.push(limit);
        return (0, db_1.dbAll)(`SELECT id, user_id, event_id, status, createdAt FROM registrations ${whereSql}
      ORDER BY ${sortField} ${sortOrder} LIMIT ?;`, params);
    }
    async findById(id) {
        const regId = (0, sql_1.sqlNumber)(id, 'registration id');
        const registration = await (0, db_1.dbGet)('SELECT id, user_id, event_id, status, createdAt FROM registrations WHERE id = ?;', [regId]);
        return registration || null;
    }
    async findOwnedById(id, ownerId) {
        const regId = (0, sql_1.sqlNumber)(id, 'registration id');
        const userId = (0, sql_1.sqlNumber)(ownerId, 'current user id');
        const registration = await (0, db_1.dbGet)('SELECT id, user_id, event_id, status, createdAt FROM registrations WHERE id = ? AND user_id = ?;', [regId, userId]);
        return registration || null;
    }
    async findByEventAndUser(event_id, user_id) {
        const eventId = (0, sql_1.sqlNumber)(event_id, 'event_id');
        const userId = (0, sql_1.sqlNumber)(user_id, 'user_id');
        const registration = await (0, db_1.dbGet)('SELECT id, user_id, event_id, status, createdAt FROM registrations WHERE event_id = ? AND user_id = ?;', [eventId, userId]);
        return registration || null;
    }
    async updateStatus(id, status) {
        const regId = (0, sql_1.sqlNumber)(id, 'registration id');
        const current = await this.findById(regId);
        if (!current)
            return null;
        await (0, db_1.dbRun)('UPDATE registrations SET status = ? WHERE id = ?;', [status, regId]);
        return this.findById(regId);
    }
    async delete(id) {
        const regId = (0, sql_1.sqlNumber)(id, 'registration id');
        const result = await (0, db_1.dbRun)('DELETE FROM registrations WHERE id = ?;', [regId]);
        return result.changes > 0;
    }
    async findAllWithDetails(filters = {}) {
        const sortField = (0, sql_1.pickSort)(filters.sort || 'createdAt', ['id', 'createdAt', 'status', 'event_title', 'user_name'], 'createdAt');
        const sortOrder = (0, sql_1.sqlOrder)(filters.order || 'DESC');
        const limit = (0, sql_1.sqlLimit)(filters.limit, 50);
        const where = [];
        const params = [];
        if (filters.status) {
            where.push('r.status = ?');
            params.push(filters.status);
        }
        if (filters.user_id) {
            where.push('r.user_id = ?');
            params.push((0, sql_1.sqlNumber)(filters.user_id, 'user_id'));
        }
        if (filters.event_id) {
            where.push('r.event_id = ?');
            params.push((0, sql_1.sqlNumber)(filters.event_id, 'event_id'));
        }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const sortSql = sortField === 'event_title' ? 'e.title' : sortField === 'user_name' ? 'u.name' : `r.${sortField}`;
        params.push(limit);
        return (0, db_1.dbAll)(`SELECT r.id, r.user_id, r.event_id, r.status, r.createdAt,
      u.name AS user_name, e.title AS event_title, e.category AS event_category
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN events e ON r.event_id = e.id
      ${whereSql} ORDER BY ${sortSql} ${sortOrder} LIMIT ?;`, params);
    }
    async getRegistrationStats() {
        return (0, db_1.dbAll)(`SELECT e.id AS event_id, e.title AS event_title, e.category,
      COUNT(r.id) AS total_registrations,
      SUM(CASE WHEN r.status = 'registered' THEN 1 ELSE 0 END) AS registered,
      SUM(CASE WHEN r.status = 'attended' THEN 1 ELSE 0 END) AS attended,
      SUM(CASE WHEN r.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
      FROM events e
      LEFT JOIN registrations r ON r.event_id = e.id
      GROUP BY e.id, e.title, e.category
      ORDER BY total_registrations DESC, e.id ASC;`);
    }
}
exports.RegistrationsRepository = RegistrationsRepository;
//# sourceMappingURL=registrations.repository.js.map