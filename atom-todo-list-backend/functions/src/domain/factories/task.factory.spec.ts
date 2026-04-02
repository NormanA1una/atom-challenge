import { TaskFactory } from './task.factory';

describe('TaskFactory', () => {
  it('creates a task with the given fields', () => {
    const task = TaskFactory.create('user-1', 'Buy milk', 'At the store');
    expect(task.userId).toBe('user-1');
    expect(task.title).toBe('Buy milk');
    expect(task.description).toBe('At the store');
  });

  it('sets completed to false by default', () => {
    const task = TaskFactory.create('user-1', 'Task', 'Desc');
    expect(task.completed).toBe(false);
  });

  it('generates a unique id', () => {
    const a = TaskFactory.create('u', 't', 'd');
    const b = TaskFactory.create('u', 't', 'd');
    expect(a.id).not.toBe(b.id);
  });
});
