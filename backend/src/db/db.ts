import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'app.db');
let db: sqlite3.Database | null = null;

export function getDB(): sqlite3.Database {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('SQLite DB open error:', err.message);
        process.exit(1);
      }
      console.log('SQLite DB opened:', dbPath);
      db?.run('PRAGMA foreign_keys = ON;');
    });
  }
  return db;
}
export function dbRun(sql: string): Promise<{ lastID: number; changes: number }> {
  if (process.env.NODE_ENV !== 'production') console.log('[SQL]', sql.trim().replace(/\s+/g, ' '));
  return new Promise((resolve, reject) => {
    getDB().run(sql, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
export function dbGet<T = any>(sql: string): Promise<T | undefined> {
  if (process.env.NODE_ENV !== 'production') console.log('[SQL]', sql.trim().replace(/\s+/g, ' '));
  return new Promise((resolve, reject) => {
    getDB().get(sql, (err, row) => err ? reject(err) : resolve(row as T | undefined));
  });
}
export function dbAll<T = any>(sql: string): Promise<T[]> {
  if (process.env.NODE_ENV !== 'production') console.log('[SQL]', sql.trim().replace(/\s+/g, ' '));
  return new Promise((resolve, reject) => {
    getDB().all(sql, (err, rows) => err ? reject(err) : resolve((rows || []) as T[]));
  });
}
export function closeDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) return resolve();
    db.close((err) => {
      if (err) reject(err);
      else {
        console.log('SQLite DB closed');
        db = null;
        resolve();
      }
    });
  });
}
