"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const migrationsDir = path_1.default.join(process.cwd(), 'src', 'migrations');
function splitSql(sql) {
    return sql.split(';').map((s) => s.trim()).filter(Boolean);
}
async function runMigrations() {
    console.log('Running migrations...');
    await (0, db_1.dbRun)('PRAGMA foreign_keys = ON;');
    await (0, db_1.dbRun)(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`);
    if (!fs_1.default.existsSync(migrationsDir)) {
        throw new Error(`Migrations directory not found: ${migrationsDir}`);
    }
    const files = fs_1.default.readdirSync(migrationsDir).filter((f) => /^\d+_.+\.sql$/.test(f)).sort();
    const applied = await (0, db_1.dbAll)('SELECT name FROM schema_migrations ORDER BY name;');
    const appliedSet = new Set(applied.map((m) => m.name));
    for (const file of files) {
        if (appliedSet.has(file)) {
            console.log(`Migration already applied: ${file}`);
            continue;
        }
        const fullPath = path_1.default.join(migrationsDir, file);
        const statements = splitSql(fs_1.default.readFileSync(fullPath, 'utf8'));
        for (const statement of statements)
            await (0, db_1.dbRun)(statement);
        await (0, db_1.dbRun)('INSERT INTO schema_migrations (name) VALUES (?);', [file]);
        console.log(`Migration applied: ${file}`);
    }
    console.log('DB schema initialized');
}
//# sourceMappingURL=migrations.js.map