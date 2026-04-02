import localDev from '@local-dev';

export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:5001/atom-todo-normanlunadev/us-central1/app/api',
  /** Same as API_SECRET_KEY in local-dev.firebase.json (synced to functions/.env by start-emulators). */
  apiKey: localDev.API_SECRET_KEY,
};
