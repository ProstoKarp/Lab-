import sqlite3 from 'sqlite3';
export declare function getDB(): sqlite3.Database;
export declare function dbRun(sql: string): Promise<{
    lastID: number;
    changes: number;
}>;
export declare function dbGet<T = any>(sql: string): Promise<T | undefined>;
export declare function dbAll<T = any>(sql: string): Promise<T[]>;
export declare function closeDB(): Promise<void>;
//# sourceMappingURL=db.d.ts.map