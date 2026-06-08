import sqlite3 from 'sqlite3';
type SqlParam = string | number | null;
export declare function getDB(): sqlite3.Database;
export declare function dbRun(sql: string, params?: SqlParam[]): Promise<{
    lastID: number;
    changes: number;
}>;
export declare function dbGet<T = any>(sql: string, params?: SqlParam[]): Promise<T | undefined>;
export declare function dbAll<T = any>(sql: string, params?: SqlParam[]): Promise<T[]>;
export declare function closeDB(): Promise<void>;
export {};
//# sourceMappingURL=db.d.ts.map