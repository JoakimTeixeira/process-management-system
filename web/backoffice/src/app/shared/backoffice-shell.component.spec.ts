import { Signal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../core/auth/auth.service';
import { AppRole } from '../core/models/backoffice.models';
import { BackofficeShellComponent } from './backoffice-shell.component';

interface BackofficeShellTestInstance {
  navItems: Signal<{ label: string; icon: string; href: string }[]>;
}

describe('BackofficeShellComponent', () => {
  let currentUserState: ReturnType<
    typeof signal<{
      id: string;
      name: string;
      email: string;
      role: { id: string; name: AppRole };
      team: { id: string; code: string; name: string } | null;
    } | null>
  >;
  let auth: {
    currentUser: Signal<{
      id: string;
      name: string;
      email: string;
      role: { id: string; name: AppRole };
      team: { id: string; code: string; name: string } | null;
    } | null>;
    logout: jasmine.Spy;
  };

  beforeEach(async () => {
    currentUserState = signal({
      id: 'editor-1',
      name: 'Eve Editor',
      email: 'eve@example.com',
      role: { id: 'role-1', name: 'EDITOR' as const },
      team: { id: 'team-1', code: 'OPS', name: 'Operations' },
    });

    auth = {
      currentUser: currentUserState.asReadonly(),
      logout: jasmine.createSpy('logout'),
    };

    await TestBed.configureTestingModule({
      imports: [BackofficeShellComponent],
      providers: [
        { provide: AuthService, useValue: auth },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('keeps Procedures between Processes and Glossary for content roles', () => {
    const fixture = TestBed.createComponent(BackofficeShellComponent);
    const component =
      fixture.componentInstance as unknown as BackofficeShellTestInstance;

    expect(component.navItems().map((item) => item.label)).toEqual([
      'Areas',
      'Processes',
      'Procedures',
      'Glossary',
    ]);

    currentUserState.set({
      id: 'reviewer-1',
      name: 'Riley Reviewer',
      email: 'riley@example.com',
      role: { id: 'role-2', name: 'REVIEWER' },
      team: { id: 'team-1', code: 'OPS', name: 'Operations' },
    });

    expect(component.navItems().map((item) => item.label)).toEqual([
      'Processes',
      'Procedures',
      'Glossary',
    ]);
  });
});
