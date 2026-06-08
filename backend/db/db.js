"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDB = getDB;
exports.dbRun = dbRun;
exports.dbGet = dbGet;
exports.dbAll = dbAll;
exports.closeDB = closeDB;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const dataDir = path_1.default.join(process.cwd(), 'data');
const dbPath = path_1.default.join(dataDir, 'app.db');
let db = null;
function getDB() {
    if (!fs_1.default.existsSync(dataDir))
        fs_1.default.mkdirSync(dataDir, { recursive: true });
    if (!db) {
        db = new sqlite3_1.default.Database(dbPath, (err) => {
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
function logSql(sql, params = []) {
    if (process.env.NODE_ENV !== 'production') {
        const compact = sql.trim().replace(/\s+/g, ' ');
        console.log('[SQL]', compact, params.length ? JSON.stringify(params) : '');
    }
}
function dbRun(sql, params = []) {
    logSql(sql, params);
    return new Promise((resolve, reject) => {
        getDB().run(sql, params, function (err) {
            if (err)
                reject(err);
            else
                resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}
function dbGet(sql, params = []) {
    logSql(sql, params);
    return new Promise((resolve, reject) => {
        getDB().get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    });
}
function dbAll(sql, params = []) {
    logSql(sql, params);
    return new Promise((resolve, reject) => {
        getDB().all(sql, params, (err, rows) => err ? reject(err) : resolve((rows || [])));
    });
}
function closeDB() {
    return new Promise((resolve, reject) => {
        if (!db)
            return resolve();
        db.close((err) => {
            if (err)
                reject(err);
            else {
                console.log('SQLite DB closed');
                db = null;
                resolve();
            }
        });
    });
}
//# sourceMappingURL=db.js.map