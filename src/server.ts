import { App } from './app';
import { closeDB } from './db/db';
import { runMigrations } from './db/migrations';

const PORT = Number(process.env.PORT || 3000);
async function start(): Promise<void> {
  try {
    await runMigrations();
    new App().listen(PORT);
    process.on('SIGINT', async () => {
      console.log('\nShutting down...');
      await closeDB();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
start();
