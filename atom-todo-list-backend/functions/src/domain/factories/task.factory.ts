import { v4 as uuidv4 } from 'uuid';
import { Task } from '../entities/task.entity';

export class TaskFactory {
  static create(userId: string, title: string, description: string): Task {
    return {
      id: uuidv4(),
      userId,
      title,
      description,
      completed: false,
      createdAt: new Date(),
    };
  }
}
