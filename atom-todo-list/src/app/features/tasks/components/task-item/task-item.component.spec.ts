import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TaskItemComponent } from './task-item.component';
import { Task } from '../../../../core/models/task.model';

const PENDING_TASK: Task = {
  id: 'task1',
  userId: 'user1',
  title: 'Test Task',
  description: 'A description',
  completed: false,
  createdAt: new Date().toISOString(),
};

describe('TaskItemComponent', () => {
  let fixture: ComponentFixture<TaskItemComponent>;
  let component: TaskItemComponent;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskItemComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
    component = fixture.componentInstance;
    component.task = PENDING_TASK;
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  // --- Rendering ---

  it('should display the task title', () => {
    expect(el.querySelector('.task-title')?.textContent?.trim()).toBe('Test Task');
  });

  it('should display the task description', () => {
    expect(el.querySelector('.task-description')?.textContent?.trim()).toBe('A description');
  });

  it('should not render description element when description is empty', () => {
    fixture.componentRef.setInput('task', { ...PENDING_TASK, description: '' });
    fixture.detectChanges();
    expect(el.querySelector('.task-description')).toBeNull();
  });

  // --- Completed state ---

  it('should apply strikethrough class when task is completed', () => {
    fixture.componentRef.setInput('task', { ...PENDING_TASK, completed: true });
    fixture.detectChanges();
    expect(el.querySelector('.task-title')?.classList.contains('strikethrough')).toBe(true);
  });

  it('should not apply strikethrough class when task is pending', () => {
    expect(el.querySelector('.task-title')?.classList.contains('strikethrough')).toBe(false);
  });

  // --- Output events ---

  it('should emit toggleComplete when the checkbox changes', () => {
    const spy = vi.fn();
    component.toggleComplete.subscribe(spy);
    component.toggleComplete.emit(PENDING_TASK);
    expect(spy).toHaveBeenCalledWith(PENDING_TASK);
  });

  it('should emit editTask when the edit button is clicked', () => {
    const spy = vi.fn();
    component.editTask.subscribe(spy);
    const editButton = el.querySelectorAll('button[mat-icon-button]')[0] as HTMLButtonElement;
    editButton.click();
    expect(spy).toHaveBeenCalledWith(PENDING_TASK);
  });

  it('should emit deleteTask when the delete button is clicked', () => {
    const spy = vi.fn();
    component.deleteTask.subscribe(spy);
    const deleteButton = el.querySelectorAll('button[mat-icon-button]')[1] as HTMLButtonElement;
    deleteButton.click();
    expect(spy).toHaveBeenCalledWith(PENDING_TASK);
  });
});
