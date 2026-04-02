import express, { Application } from 'express';
import { errorHandlerMiddleware } from './middleware/error-handler.middleware';
import { apiKeyMiddleware } from './middleware/api-key.middleware';
import { corsMiddleware } from './middleware/cors.middleware';
import userRoutes from './routes/user.routes';
import taskRoutes from './routes/task.routes';

export function createApp(): Application {
  const app = express();

  // Global middleware
  app.use(corsMiddleware);
  app.options('*', corsMiddleware); // handle preflight requests

  app.use(express.json());

  // Protected API routes
  app.use('/api', apiKeyMiddleware);
  app.use('/api/users', userRoutes);
  app.use('/api/tasks', taskRoutes);

  // Global error handler (must be last)
  app.use(errorHandlerMiddleware);

  return app;
}
