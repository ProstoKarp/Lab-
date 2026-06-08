import express from 'express';
import { ErrorHandlerMiddleware } from './middleware/error-handler.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';
import eventsRoutes from './routes/events.routes';
import healthRoutes from './routes/health.routes';
import registrationsRoutes from './routes/registrations.routes';
import usersRoutes from './routes/users.routes';

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
]);

export class App {
  private app = express();

  constructor() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(LoggerMiddleware.log);
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (!origin || allowedOrigins.has(origin)) {
        if (origin) res.header('Access-Control-Allow-Origin', origin);
        res.header('Vary', 'Origin');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Demo-UserId');
      }
      if (req.method === 'OPTIONS') {
        res.sendStatus(!origin || allowedOrigins.has(origin) ? 204 : 403);
        return;
      }
      if (origin && !allowedOrigins.has(origin)) {
        res.status(403).json({ error: { code: 'CORS_FORBIDDEN', message: 'CORS origin is not allowed', statusCode: 403, details: origin } });
        return;
      }
      next();
    });

    this.app.use('/api/v1/health', healthRoutes);
    this.app.use('/api/v1/users', usersRoutes);
    this.app.use('/api/v1/events', eventsRoutes);
    this.app.use('/api/v1/registrations', registrationsRoutes);

    // Backward-compatible aliases for older Postman checks from Lab 03.
    this.app.use('/api/health', healthRoutes);
    this.app.use('/api/users', usersRoutes);
    this.app.use('/api/events', eventsRoutes);
    this.app.use('/api/registrations', registrationsRoutes);

    this.app.get('/', (req, res) => res.json({ data: { message: 'Board Application API', version: '0.4.0', api: '/api/v1' } }));
    this.app.use((req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found', statusCode: 404, details: req.originalUrl } }));
    this.app.use(ErrorHandlerMiddleware.handle);
  }

  listen(port: number): void {
    this.app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
  }
}
