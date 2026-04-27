import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AppRole } from '../models/backoffice.models';
import { anonymousOnlyGuard, authGuard, roleGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('backoffice auth guards', () => {
  let router: jasmine.SpyObj<Router>;
  let isAuthenticatedState: ReturnType<typeof signal<boolean>>;
  let currentRoleState: ReturnType<typeof signal<AppRole | undefined>>;
  let defaultRouteState: ReturnType<typeof signal<string>>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.callFake((commands: readonly unknown[]) => ({
      commands,
    }) as never);

    isAuthenticatedState = signal(false);
    currentRoleState = signal<AppRole | undefined>(undefined);
    defaultRouteState = signal('/processes');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: isAuthenticatedState.asReadonly(),
            currentUser: () =>
              currentRoleState()
                ? {
                    id: 'user-1',
                    name: 'Test User',
                    email: 'test@example.com',
                    role: { id: 'role-1', name: currentRoleState()! },
                    team: { id: 'team-1', code: 'OPS', name: 'Operations' },
                  }
                : null,
            getDefaultRoute: () => defaultRouteState(),
          },
        },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('authGuard allows authenticated users and redirects anonymous users to login', () => {
    const loginTree = router.createUrlTree(['/login']);

    const anonymousResult = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );

    expect(anonymousResult).toEqual(loginTree);

    isAuthenticatedState.set(true);

    const authenticatedResult = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );

    expect(authenticatedResult).toBeTrue();
  });

  it('anonymousOnlyGuard redirects authenticated users to their default route', () => {
    const anonymousResult = TestBed.runInInjectionContext(() =>
      anonymousOnlyGuard({} as never, {} as never),
    );

    expect(anonymousResult).toBeTrue();

    isAuthenticatedState.set(true);
    defaultRouteState.set('/admin/users');
    const defaultRouteTree = router.createUrlTree(['/admin/users']);

    const authenticatedResult = TestBed.runInInjectionContext(() =>
      anonymousOnlyGuard({} as never, {} as never),
    );

    expect(authenticatedResult).toEqual(defaultRouteTree);
  });

  it('roleGuard allows matching roles, denies non-matching roles, and ignores empty role metadata', () => {
    currentRoleState.set('EDITOR');
    const deniedTree = router.createUrlTree(['/processes']);

    const allowedResult = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles: ['EDITOR'] } } as never, {} as never),
    );
    expect(allowedResult).toBeTrue();

    const deniedResult = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles: ['REVIEWER'] } } as never, {} as never),
    );
    expect(deniedResult).toEqual(deniedTree);

    const openResult = TestBed.runInInjectionContext(() =>
      roleGuard({ data: {} } as never, {} as never),
    );
    expect(openResult).toBeTrue();
  });
});
