import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { Task, UpdateTaskPayload } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { TaskEditDialogComponent } from './components/task-edit-dialog/task-edit-dialog.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskItemComponent } from './components/task-item/task-item.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TaskFormComponent,
    TaskItemComponent,
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly tasks = signal<Task[]>([]);
  readonly isLoading = signal(false);

  private get userId(): string {
    return sessionStorage.getItem('userId') ?? '';
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.taskService
      .getTasks(this.userId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: tasks => this.tasks.set(tasks),
        error: () => this.showError('Failed to load tasks.'),
      });
  }

  onTaskAdded(payload: { title: string; description: string }): void {
    this.taskService
      .createTask({ userId: this.userId, ...payload })
      .subscribe({
        next: task => this.tasks.update(list => [...list, task]),
        error: () => this.showError('Failed to create task.'),
      });
  }

  onToggleComplete(task: Task): void {
    this.taskService
      .updateTask(task.id, { completed: !task.completed })
      .subscribe({
        next: updated => this.replaceTask(updated),
        error: () => this.showError('Failed to update task.'),
      });
  }

  onEditTask(task: Task): void {
    this.dialog
      .open(TaskEditDialogComponent, { data: task, width: '400px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((payload: UpdateTaskPayload | null) => {
        if (!payload) return;
        this.taskService
          .updateTask(task.id, payload)
          .subscribe({
            next: updated => this.replaceTask(updated),
            error: () => this.showError('Failed to update task.'),
          });
      });
  }

  onDeleteTask(task: Task): void {
    const data: ConfirmDialogData = {
      title: 'Delete task',
      message: `Are you sure you want to delete "${task.title}"?`,
      confirmLabel: 'Delete',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data, width: '360px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (!confirmed) return;
        this.taskService
          .deleteTask(task.id)
          .subscribe({
            next: () => this.tasks.update(list => list.filter(t => t.id !== task.id)),
            error: () => this.showError('Failed to delete task.'),
          });
      });
  }

  logout(): void {
    sessionStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }

  private replaceTask(updated: Task): void {
    this.tasks.update(list => list.map(t => (t.id === updated.id ? updated : t)));
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 4000 });
  }
}
