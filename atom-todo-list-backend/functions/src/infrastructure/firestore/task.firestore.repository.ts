import { CollectionReference, DocumentSnapshot, Timestamp, UpdateData } from 'firebase-admin/firestore';
import { Task } from '../../domain/entities/task.entity';
import { TaskRepository, TaskUpdatePayload } from '../../domain/repositories/task.repository';
import { getFirestoreClient } from './firestore.client';

export class TaskFirestoreRepository implements TaskRepository {
  private readonly collection: CollectionReference;

  constructor() {
    this.collection = getFirestoreClient().collection('tasks');
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'asc')
      .get();
    return snapshot.docs.map(doc => this.toTask(doc));
  }

  async findById(id: string): Promise<Task | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return this.toTask(doc);
  }

  async save(task: Task): Promise<Task> {
    await this.collection.doc(task.id).set({
      userId: task.userId,
      title: task.title,
      description: task.description,
      completed: task.completed,
      createdAt: Timestamp.fromDate(task.createdAt),
    });
    return task;
  }

  async update(id: string, payload: TaskUpdatePayload): Promise<Task> {
    await this.collection.doc(id).update(payload as UpdateData<Record<string, unknown>>);
    const updated = await this.findById(id);
    return updated!;
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  private toTask(doc: DocumentSnapshot): Task {
    const data = doc.data() as Record<string, unknown>;
    return {
      id: doc.id,
      userId: data['userId'] as string,
      title: data['title'] as string,
      description: data['description'] as string,
      completed: data['completed'] as boolean,
      createdAt: (data['createdAt'] as Timestamp).toDate(),
    };
  }
}
