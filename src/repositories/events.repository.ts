import { dbAll, dbGet, dbRun } from '../db/db';
import { pickSort, sqlLimit, sqlNumber, sqlOrder } from '../db/sql';
import { EventRow } from '../dtos/events.dto';

type EventFilters = { category?: string; author_id?: unknown; q?: string; sort?: string; order?: string; limit?: unknown };

export class EventsRepository {
  async create(title: string, description: string, category: string, author_id: unknown): Promise<EventRow> {
    const authorId = sqlNumber(author_id, 'author_id');
    const result = await dbRun(
      'INSERT INTO events (title, description, category, author_id) VALUES (?, ?, ?, ?);',
      [title, description, category, authorId]
    );
    const event = await this.findById(result.lastID);
    if (!event) throw new Error('Failed to create event');
    return event;
  }
  async findAll(filters: EventFilters = {}): Promise<EventRow[]> {
    const sortField = pickSort(filters.sort || 'createdAt', ['id', 'title', 'category', 'author_id', 'createdAt', 'updatedAt'], 'createdAt');
    const sortOrder = sqlOrder(filters.order || 'DESC');
    const limit = sqlLimit(filters.limit, 50);
    const where: string[] = [];
    const params: (string | number | null)[] = [];
    if (filters.category) { where.push('category = ?'); params.push(filters.category); }
    if (filters.author_id) { where.push('author_id = ?'); params.push(sqlNumber(filters.author_id, 'author_id')); }
    if (filters.q) {
      where.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${filters.q}%`, `%${filters.q}%`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    params.push(limit);
    return dbAll<EventRow>(`SELECT id, title, description, category, author_id, createdAt, updatedAt
      FROM events ${whereSql} ORDER BY ${sortField} ${sortOrder} LIMIT ?;`, params);
  }
  async findById(id: unknown): Promise<EventRow | null> {
    const eventId = sqlNumber(id, 'event id');
    const event = await dbGet<EventRow>('SELECT id, title, description, category, author_id, createdAt, updatedAt FROM events WHERE id = ?;', [eventId]);
    return event || null;
  }
  async findOwnedById(id: unknown, ownerId: unknown): Promise<EventRow | null> {
    const eventId = sqlNumber(id, 'event id');
    const userId = sqlNumber(ownerId, 'current user id');
    const event = await dbGet<EventRow>(
      'SELECT id, title, description, category, author_id, createdAt, updatedAt FROM events WHERE id = ? AND author_id = ?;',
      [eventId, userId]
    );
    return event || null;
  }
  async findWithAuthor(filters: EventFilters = {}): Promise<any[]> {
    const sortField = pickSort(filters.sort || 'createdAt', ['id', 'title', 'category', 'createdAt', 'author_name'], 'createdAt');
    const sortOrder = sqlOrder(filters.order || 'DESC');
    const limit = sqlLimit(filters.limit, 50);
    const where: string[] = [];
    const params: (string | number | null)[] = [];
    if (filters.category) { where.push('e.category = ?'); params.push(filters.category); }
    if (filters.author_id) { where.push('e.author_id = ?'); params.push(sqlNumber(filters.author_id, 'author_id')); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sortSql = sortField === 'author_name' ? 'u.name' : `e.${sortField}`;
    params.push(limit);
    return dbAll(`SELECT e.id, e.title, e.description, e.category, e.author_id, e.createdAt, e.updatedAt,
      u.name AS author_name
      FROM events e JOIN users u ON u.id = e.author_id
      ${whereSql} ORDER BY ${sortSql} ${sortOrder} LIMIT ?;`, params);
  }

  async update(id: unknown, updates: Partial<{ title: string; description: string; category: string }>): Promise<EventRow | null> {
    const eventId = sqlNumber(id, 'event id');
    const current = await this.findById(eventId);
    if (!current) return null;
    const fields: string[] = [];
    const params: (string | number | null)[] = [];
    if (updates.title !== undefined) { fields.push('title = ?'); params.push(updates.title); }
    if (updates.description !== undefined) { fields.push('description = ?'); params.push(updates.description); }
    if (updates.category !== undefined) { fields.push('category = ?'); params.push(updates.category); }
    if (fields.length === 0) return current;
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    params.push(eventId);
    await dbRun(`UPDATE events SET ${fields.join(', ')} WHERE id = ?;`, params);
    return this.findById(eventId);
  }
  async delete(id: unknown): Promise<boolean> {
    const eventId = sqlNumber(id, 'event id');
    const result = await dbRun('DELETE FROM events WHERE id = ?;', [eventId]);
    return result.changes > 0;
  }
}
