import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Task, UpdateTaskPayload } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-edit-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './task-edit-dialog.component.html',
  styleUrl: './task-edit-dialog.component.scss',
})
export class TaskEditDialogComponent {
  readonly dialogRef = inject(MatDialogRef<TaskEditDialogComponent>);
  readonly task = inject<Task>(MAT_DIALOG_DATA);

  readonly form = new FormGroup({
    title: new FormControl(this.task.title, [Validators.required, Validators.maxLength(100)]),
    description: new FormControl(this.task.description, [Validators.maxLength(500)]),
  });

  onSave(): void {
    if (this.form.invalid) return;
    const payload: UpdateTaskPayload = {
      title: this.form.value.title!,
      description: this.form.value.description ?? '',
    };
    this.dialogRef.close(payload);
  }
}
