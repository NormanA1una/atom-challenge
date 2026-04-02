import { Task } from '../entities/task.entity';

export type TaskUpdatePayload = Partial<Pick<Task, 'title' | 'description' | 'completed'>>;

export interface TaskRepository {
  findByUserId(userId: string): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<Task>;
  update(id: string, payload: TaskUpdatePayload): Promise<Task>;
  delete(id: string): Promise<void>;
}
