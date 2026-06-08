import express from 'express';
import { ErrorHandlerMiddleware } from './middleware/error-handler.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';
import eventsRoutes from './routes/events.routes';
import healthRoutes from './routes/health.routes';
import registrationsRoutes from './routes/registrations.routes';
import usersRoutes from './routes/users.routes';

export class App {
  private app = express();
  constructor() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(LoggerMiddleware.log);
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      if (req.method === 'OPTIONS') { res.sendStatus(200); return; }
      next();
    });
    this.app.use('/api/health', healthRoutes);
    this.app.use('/api/users', usersRoutes);
    this.app.use('/api/events', eventsRoutes);
    this.app.use('/api/registrations', registrationsRoutes);
    this.app.get('/', (req, res) => res.json({ data: { message: 'Board Application API', version: '0.3.0' } }));
    this.app.use((req, res) => res.status(404).json({ error: { message: 'Route not found', statusCode: 404 } }));
    this.app.use(ErrorHandlerMiddleware.handle);
  }
  listen(port: number): void {
    this.app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
  }
}
