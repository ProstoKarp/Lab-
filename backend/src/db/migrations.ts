import fs from 'fs';
import path from 'path';
import { dbAll, dbRun } from './db';
import { sqlText } from './sql';

type MigrationRow = { name: string };
const migrationsDir = path.join(process.cwd(), 'src', 'migrations');

function splitSql(sql: string): string[] {
  return sql.split(';').map((s) => s.trim()).filter(Boolean);
}
export async function runMigrations(): Promise<void> {
  console.log('Running migrations...');
  await dbRun('PRAGMA foreign_keys = ON;');
  await dbRun(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`);
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }
  const files = fs.readdirSync(migrationsDir).filter((f) => /^\d+_.+\.sql$/.test(f)).sort();
  const applied = await dbAll<MigrationRow>('SELECT name FROM schema_migrations ORDER BY name;');
  const appliedSet = new Set(applied.map((m) => m.name));
  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`Migration already applied: ${file}`);
      continue;
    }
    const fullPath = path.join(migrationsDir, file);
    const statements = splitSql(fs.readFileSync(fullPath, 'utf8'));
    for (const statement of statements) await dbRun(statement);
    await dbRun(`INSERT INTO schema_migrations (name) VALUES (${sqlText(file)});`);
    console.log(`Migration applied: ${file}`);
  }
  console.log('DB schema initialized');
}
