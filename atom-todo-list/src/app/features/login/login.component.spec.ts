import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

const mockUser: User = { id: 'user1', email: 'test@example.com', createdAt: new Date().toISOString() };

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let userService: { findByEmail: ReturnType<typeof vi.fn>; createUser: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };

  function makeDialogRef(result: unknown): Pick<MatDialogRef<unknown>, 'afterClosed'> {
    return { afterClosed: vi.fn().mockReturnValue(of(result)) };
  }

  beforeEach(async () => {
    userService = { findByEmail: vi.fn(), createUser: vi.fn() };
    router = { navigate: vi.fn() };
    dialog = { open: vi.fn().mockReturnValue(makeDialogRef(true)) };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideNoopAnimations(),
        { provide: UserService, useValue: userService },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    sessionStorage.clear();
  });

  afterEach(() => sessionStorage.clear());

  // --- Form validation ---

  it('should start with an invalid form', () => {
    expect(component.emailControl.invalid).toBe(true);
  });

  it('should be invalid with a non-email string', () => {
    component.emailControl.setValue('not-an-email');
    expect(component.emailControl.hasError('email')).toBe(true);
  });

  it('should be valid with a proper email', () => {
    component.emailControl.setValue('user@example.com');
    expect(component.emailControl.valid).toBe(true);
  });

  // --- onSubmit guard ---

  it('should not call the service when form is invalid', () => {
    component.onSubmit();
    expect(userService.findByEmail).not.toHaveBeenCalled();
  });

  // --- Existing user flow ---

  it('should save userId to sessionStorage and navigate to /tasks when user exists', () => {
    userService.findByEmail.mockReturnValue(of(mockUser));
    component.emailControl.setValue('test@example.com');
    component.onSubmit();

    expect(sessionStorage.getItem('userId')).toBe('user1');
    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should set isLoading back to false after successful login', () => {
    userService.findByEmail.mockReturnValue(of(mockUser));
    component.emailControl.setValue('test@example.com');
    component.onSubmit();

    expect(component.isLoading()).toBe(false);
  });

  // --- New user flow ---

  it('should open confirm dialog when user is not found', () => {
    userService.findByEmail.mockReturnValue(of(null));
    userService.createUser.mockReturnValue(of(mockUser));
    component.emailControl.setValue('new@example.com');
    component.onSubmit();

    expect(dialog.open).toHaveBeenCalled();
  });

  it('should create user and navigate after dialog is confirmed', () => {
    userService.findByEmail.mockReturnValue(of(null));
    userService.createUser.mockReturnValue(of(mockUser));
    component.emailControl.setValue('new@example.com');
    component.onSubmit();

    expect(userService.createUser).toHaveBeenCalledWith('new@example.com');
    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should not create user and not navigate when dialog is cancelled', () => {
    dialog.open.mockReturnValue(makeDialogRef(false));
    userService.findByEmail.mockReturnValue(of(null));
    component.emailControl.setValue('new@example.com');
    component.onSubmit();

    expect(userService.createUser).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  // --- Error handling ---

  it('should set errorMessage when service throws', () => {
    userService.findByEmail.mockReturnValue(throwError(() => new Error('server error')));
    component.emailControl.setValue('test@example.com');
    component.onSubmit();

    expect(component.errorMessage()).toBe('Something went wrong. Please try again.');
  });

  it('should set isLoading back to false on error', () => {
    userService.findByEmail.mockReturnValue(throwError(() => new Error()));
    component.emailControl.setValue('test@example.com');
    component.onSubmit();

    expect(component.isLoading()).toBe(false);
  });
});
