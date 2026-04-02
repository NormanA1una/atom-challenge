export class NotFoundError extends Error {
  constructor(entity: string, identifier: string) {
    super(`${entity} with identifier '${identifier}' was not found.`);
    this.name = 'NotFoundError';
  }
}
