import { Task } from '../../../domain/entities/task.entity';
import { TaskFactory } from '../../../domain/factories/task.factory';
import { TaskRepository } from '../../../domain/repositories/task.repository';

export class CreateTaskUseCase {
  constructor(private readonly taskRepo: TaskRepository) {}

  async execute(userId: string, title: string, description: string): Promise<Task> {
    const task = TaskFactory.create(userId, title, description);
    return this.taskRepo.save(task);
  }
}
