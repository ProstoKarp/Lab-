import express, { Express, Request, Response, NextFunction } from 'express';
import { LoggerMiddleware } from '../src/middleware/logger.middleware';
import { ErrorHandlerMiddleware } from '../src/middleware/error-handler.middleware';

import usersRoutes from '../src/routes/users.routes';
import eventsRoutes from '../src/routes/events.routes';
import registrationsRoutes from '../src/routes/registrations.routes';
import healthRoutes from '../src/routes/health.routes';

export class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    // Body parser middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logger middleware
    this.app.use(LoggerMiddleware.log);

    // CORS middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }

  private setupRoutes(): void {
    // API Routes
    this.app.use('/api/health', healthRoutes);
    this.app.use('/api/users', usersRoutes);
    this.app.use('/api/events', eventsRoutes);
    this.app.use('/api/registrations', registrationsRoutes);

    // Root route
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Board Application API',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          users: '/api/users',
          events: '/api/events',
          registrations: '/api/registrations',
        },
      });
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: {
          message: 'Route not found',
          statusCode: 404,
        },
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(ErrorHandlerMiddleware.handle);
  }

  public getApp(): Express {
    return this.app;
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }
}
