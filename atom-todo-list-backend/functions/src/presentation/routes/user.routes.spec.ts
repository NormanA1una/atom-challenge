import supertest from 'supertest';
import { createApp } from '../app';
import { UserFirestoreRepository } from '../../infrastructure/firestore/user.firestore.repository';
import { User } from '../../domain/entities/user.entity';

// Mocked before any module loads (jest.mock is hoisted)
jest.mock('../../infrastructure/firestore/user.firestore.repository', () => ({
  UserFirestoreRepository: jest.fn().mockImplementation(() => ({
    findByEmail: jest.fn(),
    save: jest.fn(),
  })),
}));

// Prevent TaskFirestoreRepository from initializing Firestore when app.ts loads
jest.mock('../../infrastructure/firestore/task.firestore.repository', () => ({
  TaskFirestoreRepository: jest.fn().mockImplementation(() => ({
    findByUserId: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}));

process.env['API_SECRET_KEY'] = 'test-key';

const API_KEY = 'test-key';

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
};

describe('User Routes — /api/users', () => {
  let request: ReturnType<typeof supertest>;
  let mockRepo: { findByEmail: jest.Mock; save: jest.Mock };

  beforeAll(() => {
    const app = createApp();
    request = supertest(app);
    // Instance created in user.routes.ts at module load time
    mockRepo = (UserFirestoreRepository as jest.Mock).mock.results[0].value;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Authentication ---

  describe('Authentication middleware', () => {
    it('should return 401 when X-API-Key header is missing', async () => {
      const res = await request.get('/api/users?email=test@example.com');
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ error: 'Unauthorized' });
    });

    it('should return 401 when X-API-Key is incorrect', async () => {
      const res = await request
        .get('/api/users?email=test@example.com')
        .set('X-API-Key', 'wrong-key');
      expect(res.status).toBe(401);
    });
  });

  // --- GET /api/users ---

  describe('GET /api/users', () => {
    it('should return 200 with the user when found', async () => {
      mockRepo.findByEmail.mockResolvedValue(mockUser);

      const res = await request
        .get('/api/users?email=test@example.com')
        .set('X-API-Key', API_KEY);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: 'user-1', email: 'test@example.com' });
      expect(mockRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return 404 when user is not found', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      const res = await request
        .get('/api/users?email=noone@example.com')
        .set('X-API-Key', API_KEY);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'User not found.' });
    });

    it('should return 400 when email query param is missing', async () => {
      const res = await request.get('/api/users').set('X-API-Key', API_KEY);
      expect(res.status).toBe(400);
    });
  });

  // --- POST /api/users ---

  describe('POST /api/users', () => {
    it('should return 201 with the created user', async () => {
      mockRepo.save.mockResolvedValue(mockUser);

      const res = await request
        .post('/api/users')
        .set('X-API-Key', API_KEY)
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ id: 'user-1', email: 'test@example.com' });
    });

    it('should return 400 when email body field is missing', async () => {
      const res = await request
        .post('/api/users')
        .set('X-API-Key', API_KEY)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should return 400 when body is empty', async () => {
      const res = await request
        .post('/api/users')
        .set('X-API-Key', API_KEY);

      expect(res.status).toBe(400);
    });
  });
});
