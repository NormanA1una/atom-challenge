import { Task } from '../../../domain/entities/task.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { TaskRepository, TaskUpdatePayload } from '../../../domain/repositories/task.repository';

export class UpdateTaskUseCase {
  constructor(private readonly taskRepo: TaskRepository) {}

  async execute(id: string, payload: TaskUpdatePayload): Promise<Task> {
    const existing = await this.taskRepo.findById(id);
    if (!existing) throw new NotFoundError('Task', id);
    return this.taskRepo.update(id, payload);
  }
}
