import { NotFoundError } from '../../../domain/errors/not-found.error';
import { TaskRepository } from '../../../domain/repositories/task.repository';

export class DeleteTaskUseCase {
  constructor(private readonly taskRepo: TaskRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.taskRepo.findById(id);
    if (!existing) throw new NotFoundError('Task', id);
    return this.taskRepo.delete(id);
  }
}
