"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./db/db");
const migrations_1 = require("./db/migrations");
const PORT = Number(process.env.PORT || 3000);
async function start() {
    try {
        await (0, migrations_1.runMigrations)();
        new app_1.App().listen(PORT);
        process.on('SIGINT', async () => {
            console.log('\nShutting down...');
            await (0, db_1.closeDB)();
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=server.js.map