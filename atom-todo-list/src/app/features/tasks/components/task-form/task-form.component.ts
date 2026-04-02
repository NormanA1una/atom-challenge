import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CreateTaskPayload } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent {
  @Output() taskSubmit = new EventEmitter<Omit<CreateTaskPayload, 'userId'>>();

  readonly isExpanded = signal(false);

  readonly form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    description: new FormControl('', [Validators.maxLength(500)]),
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.taskSubmit.emit({
      title: this.form.value.title!,
      description: this.form.value.description ?? '',
    });
    this.form.reset();
    this.isExpanded.set(false);
  }

  onCancel(): void {
    this.form.reset();
    this.isExpanded.set(false);
  }
}
