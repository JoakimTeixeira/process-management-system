import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AuthService } from '../auth/auth.service';
import { AccessControlUtil } from './access-control.util';

describe('AccessControlUtil', () => {
  let currentUserState: ReturnType<
    typeof signal<{
      id: string;
      name: string;
      email: string;
      role: { id: string; name: 'EDITOR' | 'REVIEWER' | 'PUBLISHER' | 'VIEWER' | 'SYSTEM_ADMIN' };
      team: { id: string; code: string; name: string } | null;
    } | null>
  >;
  let service: AccessControlUtil;

  const process = {
    id: 'process-1',
    areaId: 'area-1',
    code: '1',
    title: 'Change control',
    description: 'Process description',
    teamId: 'team-1',
    teamName: 'Operations',
    ownerId: 'owner-1',
    ownerName: 'Alice Owner',
  };

  beforeEach(() => {
    currentUserState = signal({
      id: 'editor-1',
      name: 'Eve Editor',
      email: 'eve@example.com',
      role: { id: 'role-1', name: 'EDITOR' as const },
      team: { id: 'team-1', code: 'OPS', name: 'Operations' },
    });

    TestBed.configureTestingModule({
      providers: [
        AccessControlUtil,
        {
          provide: AuthService,
          useValue: {
            currentUser: currentUserState.asReadonly(),
          },
        },
      ],
    });

    service = TestBed.inject(AccessControlUtil);
  });

  it('allows same-team editors to manage processes and create versions', () => {
    expect(service.canManageProcess(process)).toBeTrue();
    expect(service.canCreateVersion(process)).toBeTrue();
    expect(service.getAvailableTeams([{ id: 'team-1', name: 'Operations' }])).toEqual([
      { id: 'team-1', name: 'Operations' },
    ]);
    expect(service.getLockedTeamId(process)).toBe('team-1');
  });

  it('blocks non-editors and cross-team editors from process and version mutation', () => {
    currentUserState.set({
      id: 'reviewer-1',
      name: 'Riley Reviewer',
      email: 'riley@example.com',
      role: { id: 'role-2', name: 'REVIEWER' },
      team: { id: 'team-1', code: 'OPS', name: 'Operations' },
    });

    expect(service.canManageProcess(process)).toBeFalse();
    expect(service.canCreateVersion(process)).toBeFalse();
    expect(service.canManageVersion(process, { lifecycleState: 'Draft' })).toBeFalse();

    currentUserState.set({
      id: 'editor-2',
      name: 'Finley Editor',
      email: 'finley@example.com',
      role: { id: 'role-1', name: 'EDITOR' },
      team: { id: 'team-2', code: 'FIN', name: 'Finance' },
    });

    expect(service.canManageProcess(process)).toBeFalse();
    expect(service.canCreateVersion(process)).toBeFalse();
    expect(service.canManageVersion(process, { lifecycleState: 'Draft' })).toBeFalse();
  });

  it('allows direct version mutation only for same-team editors on draft versions', () => {
    expect(service.canManageVersion(process, { lifecycleState: 'Draft' })).toBeTrue();
    expect(service.canManageVersion(process, { lifecycleState: 'Approved' })).toBeFalse();
    expect(service.canManageVersion(process, { lifecycleState: 'Published' })).toBeFalse();
  });

  it('reflects helper role checks and empty-team behavior', () => {
    expect(service.hasRole('EDITOR')).toBeTrue();
    expect(service.hasAnyRole(['EDITOR', 'PUBLISHER'])).toBeTrue();

    currentUserState.set({
      id: 'admin-1',
      name: 'Sam Admin',
      email: 'sam@example.com',
      role: { id: 'role-5', name: 'SYSTEM_ADMIN' },
      team: null,
    });

    expect(service.currentUserTeamId()).toBeNull();
    expect(service.getAvailableTeams([{ id: 'team-1', name: 'Operations' }])).toEqual([]);
    expect(service.getLockedTeamId(null)).toBe('');
    expect(service.hasRole('SYSTEM_ADMIN')).toBeTrue();
  });
});
