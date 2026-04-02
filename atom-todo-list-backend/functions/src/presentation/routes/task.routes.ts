import { Router, Request, Response, NextFunction } from 'express';
import { CreateTaskUseCase } from '../../application/use-cases/tasks/create-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/tasks/delete-task.use-case';
import { GetTasksByUserUseCase } from '../../application/use-cases/tasks/get-tasks-by-user.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/tasks/update-task.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import { TaskFirestoreRepository } from '../../infrastructure/firestore/task.firestore.repository';

const router = Router();

const taskRepo = new TaskFirestoreRepository();
const getTasksByUser = new GetTasksByUserUseCase(taskRepo);
const createTask = new CreateTaskUseCase(taskRepo);
const updateTask = new UpdateTaskUseCase(taskRepo);
const deleteTask = new DeleteTaskUseCase(taskRepo);

/** GET /api/tasks?userId={userId} */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') throw new ValidationError('"userId" query param is required.');
    const tasks = await getTasksByUser.execute(userId);
    res.status(200).json(tasks);
  } catch (err) { next(err); }
});

/** POST /api/tasks — body: { userId, title, description } */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, title, description } = req.body as Record<string, string | undefined>;
    if (!userId) throw new ValidationError('"userId" is required.');
    if (!title) throw new ValidationError('"title" is required.');
    if (description === undefined) throw new ValidationError('"description" is required.');
    const task = await createTask.execute(userId, title, description);
    res.status(201).json(task);
  } catch (err) { next(err); }
});

/** PUT /api/tasks/:id — body: { title?, description?, completed? } */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload = req.body as { title?: string; description?: string; completed?: boolean };
    if (Object.keys(payload).length === 0) throw new ValidationError('At least one field is required.');
    const task = await updateTask.execute(id, payload);
    res.status(200).json(task);
  } catch (err) { next(err); }
});

/** DELETE /api/tasks/:id */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteTask.execute(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
