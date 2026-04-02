import cors from 'cors';
import { config } from '../../shared/config/environment';

export const corsMiddleware = cors({
  origin: config.allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key'],
  credentials: false,
});
