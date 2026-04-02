import { Task } from '../../../domain/entities/task.entity';
import { TaskRepository } from '../../../domain/repositories/task.repository';

export class GetTasksByUserUseCase {
  constructor(private readonly taskRepo: TaskRepository) {}

  async execute(userId: string): Promise<Task[]> {
    return this.taskRepo.findByUserId(userId);
  }
}
