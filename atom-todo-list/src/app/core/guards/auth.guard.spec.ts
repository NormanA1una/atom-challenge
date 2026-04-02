import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });
    sessionStorage.clear();
  });

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );

  it('returns true when userId is in sessionStorage', () => {
    sessionStorage.setItem('userId', 'abc123');
    expect(runGuard()).toBe(true);
  });

  it('redirects to /login and returns false when userId is missing', () => {
    expect(runGuard()).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
