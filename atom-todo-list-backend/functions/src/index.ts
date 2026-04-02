import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { createApp } from './presentation/app';

const apiSecretKey = defineSecret('API_SECRET_KEY');
const allowedOrigin = defineSecret('ALLOWED_ORIGIN');

const expressApp = createApp();

export const app = onRequest(
  { secrets: [apiSecretKey, allowedOrigin] },
  expressApp,
);
