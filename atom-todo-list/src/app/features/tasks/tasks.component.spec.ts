import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { TasksComponent } from './tasks.component';
import { TaskService } from '../../core/services/task.service';
import { Task, UpdateTaskPayload } from '../../core/models/task.model';

const TASK_1: Task = {
  id: 'task1',
  userId: 'user1',
  title: 'First task',
  description: 'Desc 1',
  completed: false,
  createdAt: new Date().toISOString(),
};

const TASK_2: Task = {
  id: 'task2',
  userId: 'user1',
  title: 'Second task',
  description: 'Desc 2',
  completed: false,
  createdAt: new Date().toISOString(),
};

describe('TasksComponent', () => {
  let fixture: ComponentFixture<TasksComponent>;
  let component: TasksComponent;
  let taskService: {
    getTasks: ReturnType<typeof vi.fn>;
    createTask: ReturnType<typeof vi.fn>;
    updateTask: ReturnType<typeof vi.fn>;
    deleteTask: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };

  function makeDialogRef(result: unknown): Pick<MatDialogRef<unknown>, 'afterClosed'> {
    return { afterClosed: vi.fn().mockReturnValue(of(result)) };
  }

  beforeEach(async () => {
    taskService = {
      getTasks: vi.fn().mockReturnValue(of([TASK_1])),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
    };
    router = { navigate: vi.fn() };
    dialog = { open: vi.fn().mockReturnValue(makeDialogRef(true)) };
    snackBar = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TasksComponent],
      providers: [
        provideNoopAnimations(),
        { provide: TaskService, useValue: taskService },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    sessionStorage.setItem('userId', 'user1');
    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => sessionStorage.clear());

  // --- loadTasks ---

  it('should load tasks on init', () => {
    fixture.detectChanges();
    expect(taskService.getTasks).toHaveBeenCalledWith('user1');
    expect(component.tasks()).toEqual([TASK_1]);
  });

  it('should set isLoading to false after tasks are loaded', () => {
    fixture.detectChanges();
    expect(component.isLoading()).toBe(false);
  });

  it('should show a snack bar when loadTasks fails', () => {
    taskService.getTasks.mockReturnValue(throwError(() => new Error()));
    fixture.detectChanges();
    expect(snackBar.open).toHaveBeenCalledWith('Failed to load tasks.', 'Dismiss', expect.any(Object));
  });

  // --- onTaskAdded ---

  it('should append the new task to the list', () => {
    fixture.detectChanges();
    taskService.createTask.mockReturnValue(of(TASK_2));
    component.onTaskAdded({ title: 'Second task', description: 'Desc 2' });
    expect(component.tasks()).toEqual([TASK_1, TASK_2]);
  });

  it('should show a snack bar when createTask fails', () => {
    fixture.detectChanges();
    taskService.createTask.mockReturnValue(throwError(() => new Error()));
    component.onTaskAdded({ title: 'Task', description: '' });
    expect(snackBar.open).toHaveBeenCalledWith('Failed to create task.', 'Dismiss', expect.any(Object));
  });

  // --- onToggleComplete ---

  it('should call updateTask with the flipped completed value', () => {
    fixture.detectChanges();
    const updated = { ...TASK_1, completed: true };
    taskService.updateTask.mockReturnValue(of(updated));
    component.onToggleComplete(TASK_1);
    expect(taskService.updateTask).toHaveBeenCalledWith('task1', { completed: true });
    expect(component.tasks()[0].completed).toBe(true);
  });

  it('should show a snack bar when updateTask (toggle) fails', () => {
    fixture.detectChanges();
    taskService.updateTask.mockReturnValue(throwError(() => new Error()));
    component.onToggleComplete(TASK_1);
    expect(snackBar.open).toHaveBeenCalledWith('Failed to update task.', 'Dismiss', expect.any(Object));
  });

  // --- onEditTask ---

  it('should open the edit dialog and update the task on save', () => {
    fixture.detectChanges();
    const payload: UpdateTaskPayload = { title: 'Updated title', description: 'New desc' };
    const updated = { ...TASK_1, ...payload };
    dialog.open.mockReturnValue(makeDialogRef(payload));
    taskService.updateTask.mockReturnValue(of(updated));

    component.onEditTask(TASK_1);

    expect(taskService.updateTask).toHaveBeenCalledWith('task1', payload);
    expect(component.tasks()[0].title).toBe('Updated title');
  });

  it('should not call updateTask when edit dialog is cancelled', () => {
    fixture.detectChanges();
    dialog.open.mockReturnValue(makeDialogRef(null));

    component.onEditTask(TASK_1);

    expect(taskService.updateTask).not.toHaveBeenCalled();
  });

  // --- onDeleteTask ---

  it('should remove the task from the list after confirmation', () => {
    fixture.detectChanges();
    taskService.deleteTask.mockReturnValue(of(undefined));

    component.onDeleteTask(TASK_1);

    expect(taskService.deleteTask).toHaveBeenCalledWith('task1');
    expect(component.tasks()).toEqual([]);
  });

  it('should not call deleteTask when confirm dialog is cancelled', () => {
    fixture.detectChanges();
    dialog.open.mockReturnValue(makeDialogRef(false));

    component.onDeleteTask(TASK_1);

    expect(taskService.deleteTask).not.toHaveBeenCalled();
  });

  it('should show a snack bar when deleteTask fails', () => {
    fixture.detectChanges();
    taskService.deleteTask.mockReturnValue(throwError(() => new Error()));

    component.onDeleteTask(TASK_1);

    expect(snackBar.open).toHaveBeenCalledWith('Failed to delete task.', 'Dismiss', expect.any(Object));
  });

  // --- logout ---

  it('should clear sessionStorage and navigate to /login on logout', () => {
    fixture.detectChanges();
    component.logout();

    expect(sessionStorage.getItem('userId')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
