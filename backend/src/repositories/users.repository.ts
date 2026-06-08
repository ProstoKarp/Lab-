import { dbAll, dbGet, dbRun } from '../db/db';
import { pickSort, sqlNumber, sqlOrder, sqlText } from '../db/sql';
import { UserRow } from '../dtos/users.dto';

export class UsersRepository {
  async create(name: string): Promise<UserRow> {
    const hiddenEmail = `user-${Date.now()}-${Math.floor(Math.random() * 100000)}@local.test`;
    const result = await dbRun(`INSERT INTO users (name, email) VALUES (${sqlText(name)}, ${sqlText(hiddenEmail)});`);
    const user = await this.findById(result.lastID);
    if (!user) throw new Error('Failed to create user');
    return user;
  }
  async findAll(sortBy: string = 'id', order: string = 'ASC', limit: number = 50): Promise<UserRow[]> {
    const sortField = pickSort(sortBy, ['id', 'name', 'createdAt']);
    const sortOrder = sqlOrder(order);
    return dbAll<UserRow>(`SELECT id, name, createdAt FROM users ORDER BY ${sortField} ${sortOrder} LIMIT ${limit};`);
  }
  async findById(id: unknown): Promise<UserRow | null> {
    const userId = sqlNumber(id, 'user id');
    const user = await dbGet<UserRow>(`SELECT id, name, createdAt FROM users WHERE id = ${userId};`);
    return user || null;
  }
  async update(id: unknown, updates: Partial<{ name: string }>): Promise<UserRow | null> {
    const userId = sqlNumber(id, 'user id');
    const current = await this.findById(userId);
    if (!current) return null;
    const fields: string[] = [];
    if (updates.name !== undefined) fields.push(`name = ${sqlText(updates.name)}`);
    if (fields.length === 0) return current;
    await dbRun(`UPDATE users SET ${fields.join(', ')} WHERE id = ${userId};`);
    return this.findById(userId);
  }
  async delete(id: unknown): Promise<boolean> {
    const userId = sqlNumber(id, 'user id');
    const result = await dbRun(`DELETE FROM users WHERE id = ${userId};`);
    return result.changes > 0;
  }
}
