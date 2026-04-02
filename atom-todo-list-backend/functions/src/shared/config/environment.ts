export const config = {
  get apiSecretKey() { return process.env['API_SECRET_KEY'] ?? ''; },
  get allowedOrigin() { return process.env['ALLOWED_ORIGIN'] ?? 'http://localhost:4200'; },
};
