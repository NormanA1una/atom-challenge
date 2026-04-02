import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { filter, finalize, switchMap } from 'rxjs';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly emailControl = new FormControl('', [Validators.required, Validators.email]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  onSubmit(event?: Event): void {
    event?.preventDefault();
    if (this.emailControl.invalid) return;
    const email = this.emailControl.value!;
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService
      .findByEmail(email)
      .pipe(
        switchMap(user => {
          if (user) return [user] as const;
          const data: ConfirmDialogData = {
            title: 'New account',
            message: `No account found for ${email}. Would you like to create one?`,
            confirmLabel: 'Create',
          };
          return this.dialog
            .open(ConfirmDialogComponent, { data, width: '360px', maxWidth: '95vw' })
            .afterClosed()
            .pipe(
              filter((confirmed): confirmed is true => !!confirmed),
              switchMap(() => this.userService.createUser(email)),
            );
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: user => {
          sessionStorage.setItem('userId', user.id);
          this.router.navigate(['/tasks']);
        },
        error: () => this.errorMessage.set('Something went wrong. Please try again.'),
      });
  }
}
