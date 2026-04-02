import { UserFactory } from './user.factory';

describe('UserFactory', () => {
  it('creates a user with the given email', () => {
    const user = UserFactory.create('test@example.com');
    expect(user.email).toBe('test@example.com');
  });

  it('generates a unique id', () => {
    const a = UserFactory.create('a@a.com');
    const b = UserFactory.create('b@b.com');
    expect(a.id).not.toBe(b.id);
  });

  it('sets createdAt to the current date', () => {
    const before = new Date();
    const user = UserFactory.create('test@example.com');
    const after = new Date();
    expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
