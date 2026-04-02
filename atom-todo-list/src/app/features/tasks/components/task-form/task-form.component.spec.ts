import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TaskFormComponent } from './task-form.component';

describe('TaskFormComponent', () => {
  let fixture: ComponentFixture<TaskFormComponent>;
  let component: TaskFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --- Initial state ---

  it('should start collapsed', () => {
    expect(component.isExpanded()).toBe(false);
  });

  it('should expand when isExpanded is set to true', () => {
    component.isExpanded.set(true);
    expect(component.isExpanded()).toBe(true);
  });

  // --- Form validation ---

  it('should be invalid when title is empty', () => {
    component.isExpanded.set(true);
    fixture.detectChanges();
    expect(component.form.invalid).toBe(true);
  });

  it('should be valid when title is provided', () => {
    component.isExpanded.set(true);
    component.form.controls.title.setValue('A valid title');
    expect(component.form.valid).toBe(true);
  });

  it('should be invalid when title exceeds 100 characters', () => {
    component.isExpanded.set(true);
    component.form.controls.title.setValue('a'.repeat(101));
    expect(component.form.controls.title.hasError('maxlength')).toBe(true);
  });

  // --- onSubmit ---

  it('should emit taskSubmit with correct payload on valid submit', () => {
    const spy = vi.fn();
    component.taskSubmit.subscribe(spy);
    component.isExpanded.set(true);
    component.form.setValue({ title: 'My Task', description: 'My desc' });

    component.onSubmit();

    expect(spy).toHaveBeenCalledWith({ title: 'My Task', description: 'My desc' });
  });

  it('should reset the form and collapse after submit', () => {
    component.isExpanded.set(true);
    component.form.setValue({ title: 'My Task', description: '' });

    component.onSubmit();

    expect(component.isExpanded()).toBe(false);
    expect(component.form.value.title).toBeNull();
  });

  it('should not emit taskSubmit when form is invalid', () => {
    const spy = vi.fn();
    component.taskSubmit.subscribe(spy);
    component.isExpanded.set(true);

    component.onSubmit();

    expect(spy).not.toHaveBeenCalled();
  });

  // --- onCancel ---

  it('should collapse and reset the form on cancel', () => {
    component.isExpanded.set(true);
    component.form.controls.title.setValue('Draft title');

    component.onCancel();

    expect(component.isExpanded()).toBe(false);
    expect(component.form.value.title).toBeNull();
  });
});
