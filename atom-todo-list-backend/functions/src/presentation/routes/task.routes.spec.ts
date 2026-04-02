import supertest from 'supertest';
import { createApp } from '../app';
import { TaskFirestoreRepository } from '../../infrastructure/firestore/task.firestore.repository';
import { Task } from '../../domain/entities/task.entity';

// Mocked before any module loads (jest.mock is hoisted)
jest.mock('../../infrastructure/firestore/task.firestore.repository', () => ({
  TaskFirestoreRepository: jest.fn().mockImplementation(() => ({
    findByUserId: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Prevent UserFirestoreRepository from initializing Firestore when app.ts loads
jest.mock('../../infrastructure/firestore/user.firestore.repository', () => ({
  UserFirestoreRepository: jest.fn().mockImplementation(() => ({
    findByEmail: jest.fn(),
    save: jest.fn(),
  })),
}));

process.env['API_SECRET_KEY'] = 'test-key';

const API_KEY = 'test-key';

const mockTask: Task = {
  id: 'task-1',
  userId: 'user-1',
  title: 'Test task',
  description: 'Task description',
  completed: false,
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
};

describe('Task Routes — /api/tasks', () => {
  let request: ReturnType<typeof supertest>;
  let mockRepo: {
    findByUserId: jest.Mock;
    findById: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeAll(() => {
    const app = createApp();
    request = supertest(app);
    // Instance created in task.routes.ts at module load time
    mockRepo = (TaskFirestoreRepository as jest.Mock).mock.results[0].value;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- GET /api/tasks ---

  describe('GET /api/tasks', () => {
    it('should return 200 with a list of tasks', async () => {
      mockRepo.findByUserId.mockResolvedValue([mockTask]);

      const res = await request
        .get('/api/tasks?userId=user-1')
        .set('X-API-Key', API_KEY);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({ id: 'task-1', title: 'Test task', completed: false });
      expect(mockRepo.findByUserId).toHaveBeenCalledWith('user-1');
    });

    it('should return 200 with an empty array when user has no tasks', async () => {
      mockRepo.findByUserId.mockResolvedValue([]);

      const res = await request
        .get('/api/tasks?userId=user-1')
        .set('X-API-Key', API_KEY);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return 400 when userId query param is missing', async () => {
      const res = await request.get('/api/tasks').set('X-API-Key', API_KEY);
      expect(res.status).toBe(400);
    });

    it('should return 401 when X-API-Key header is missing', async () => {
      const res = await request.get('/api/tasks?userId=user-1');
      expect(res.status).toBe(401);
    });
  });

  // --- POST /api/tasks ---

  describe('POST /api/tasks', () => {
    it('should return 201 with the created task', async () => {
      mockRepo.save.mockResolvedValue(mockTask);

      const res = await request
        .post('/api/tasks')
        .set('X-API-Key', API_KEY)
        .send({ userId: 'user-1', title: 'Test task', description: 'Task description' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ userId: 'user-1', title: 'Test task', completed: false });
    });

    it('should return 400 when userId is missing', async () => {
      const res = await request
        .post('/api/tasks')
        .set('X-API-Key', API_KEY)
        .send({ title: 'Test task', description: 'desc' });

      expect(res.status).toBe(400);
    });

    it('should return 400 when title is missing', async () => {
      const res = await request
        .post('/api/tasks')
        .set('X-API-Key', API_KEY)
        .send({ userId: 'user-1', description: 'desc' });

      expect(res.status).toBe(400);
    });

    it('should return 400 when description is missing', async () => {
      const res = await request
        .post('/api/tasks')
        .set('X-API-Key', API_KEY)
        .send({ userId: 'user-1', title: 'Test task' });

      expect(res.status).toBe(400);
    });
  });

  // --- PUT /api/tasks/:id ---

  describe('PUT /api/tasks/:id', () => {
    it('should return 200 with the updated task', async () => {
      const updated = { ...mockTask, title: 'Updated title' };
      mockRepo.findById.mockResolvedValue(mockTask);
      mockRepo.update.mockResolvedValue(updated);

      const res = await request
        .put('/api/tasks/task-1')
        .set('X-API-Key', API_KEY)
        .send({ title: 'Updated title' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: 'task-1', title: 'Updated title' });
      expect(mockRepo.findById).toHaveBeenCalledWith('task-1');
      expect(mockRepo.update).toHaveBeenCalledWith('task-1', { title: 'Updated title' });
    });

    it('should return 200 when toggling the completed field', async () => {
      const updated = { ...mockTask, completed: true };
      mockRepo.findById.mockResolvedValue(mockTask);
      mockRepo.update.mockResolvedValue(updated);

      const res = await request
        .put('/api/tasks/task-1')
        .set('X-API-Key', API_KEY)
        .send({ completed: true });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ completed: true });
    });

    it('should return 404 when task does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      const res = await request
        .put('/api/tasks/nonexistent')
        .set('X-API-Key', API_KEY)
        .send({ title: 'New title' });

      expect(res.status).toBe(404);
    });

    it('should return 400 when request body is empty', async () => {
      const res = await request
        .put('/api/tasks/task-1')
        .set('X-API-Key', API_KEY)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // --- DELETE /api/tasks/:id ---

  describe('DELETE /api/tasks/:id', () => {
    it('should return 204 when task is deleted successfully', async () => {
      mockRepo.findById.mockResolvedValue(mockTask);
      mockRepo.delete.mockResolvedValue(undefined);

      const res = await request
        .delete('/api/tasks/task-1')
        .set('X-API-Key', API_KEY);

      expect(res.status).toBe(204);
      expect(mockRepo.findById).toHaveBeenCalledWith('task-1');
      expect(mockRepo.delete).toHaveBeenCalledWith('task-1');
    });

    it('should return 404 when task does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      const res = await request
        .delete('/api/tasks/nonexistent')
        .set('X-API-Key', API_KEY);

      expect(res.status).toBe(404);
    });
  });
});
