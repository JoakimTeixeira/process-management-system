import { Signal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { ProcessListPageComponent } from './process-list.page';

interface ProcessListPageTestInstance {
  canEdit: ProcessListPageComponent['canEdit'];
  openRoute: ProcessListPageComponent['openRoute'];
  workRoute: ProcessListPageComponent['workRoute'];
  canManageProcess: ProcessListPageComponent['canManageProcess'];
}

describe('ProcessListPageComponent', () => {
  let api: jasmine.SpyObj<BackofficeApiService>;
  let currentUserState: ReturnType<typeof signal<{
    id: string;
    name: string;
    email: string;
    role: { id: string; name: 'EDITOR' | 'REVIEWER' | 'PUBLISHER' | 'VIEWER' };
    team: { id: string; code: string; name: string };
  }>>;
  let auth: {
    hasRole: jasmine.Spy;
    currentUser: Signal<{
      id: string;
      name: string;
      email: string;
      role: { id: string; name: 'EDITOR' | 'REVIEWER' | 'PUBLISHER' | 'VIEWER' };
      team: { id: string; code: string; name: string };
    }>;
  };

  const processRecord = {
    id: 'process-1',
    areaId: 'area-1',
    code: 'P1',
    title: 'Change control',
    description: 'Process description',
    teamId: 'team-1',
    teamName: 'Operations',
    ownerId: 'owner-1',
    ownerName: 'Alice Owner',
    governanceSummary: {
      currentAsIsVersion: null,
      currentToBeVersion: null,
      activeWorkflowVersion: {
        id: 'version-1',
        versionNumber: 2,
        architectureState: 'TO-BE',
        lifecycleState: 'In Review',
        waitingForRole: 'REVIEWER',
        nextAction: 'Approve or Reject',
      },
      versionCounts: {
        total: 2,
        archived: 0,
      },
    },
  };

  beforeEach(async () => {
    api = jasmine.createSpyObj<BackofficeApiService>('BackofficeApiService', [
      'listProcesses',
    ]);
    api.listProcesses.and.returnValue(of([processRecord]));

    currentUserState = signal({
      id: 'reviewer-1',
      name: 'Riley Reviewer',
      email: 'riley@example.com',
      role: { id: 'role-2', name: 'REVIEWER' as const },
      team: { id: 'team-1', code: 'OPS', name: 'Operations' },
    });

    auth = {
      hasRole: jasmine
        .createSpy('hasRole')
        .and.callFake((role: string) => currentUserState().role.name === role),
      currentUser: currentUserState.asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [ProcessListPageComponent],
      providers: [
        { provide: BackofficeApiService, useValue: api },
        { provide: AuthService, useValue: auth },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('resolves reviewer navigation routes without editor permissions', async () => {
    const fixture = TestBed.createComponent(ProcessListPageComponent);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as ProcessListPageTestInstance;

    expect(component.canEdit()).toBeFalse();
    expect(component.canManageProcess(processRecord)).toBeFalse();
    expect(component.openRoute(processRecord)).toEqual(['/versions', 'version-1']);
    expect(component.workRoute(processRecord)).toEqual(['/versions', 'version-1']);
  });

  it('opens the active version when one exists', async () => {
    const fixture = TestBed.createComponent(ProcessListPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as ProcessListPageTestInstance;

    expect(
      component.openRoute({
        ...processRecord,
        governanceSummary: {
          ...processRecord.governanceSummary,
          activeWorkflowVersion: {
            ...processRecord.governanceSummary.activeWorkflowVersion,
            lifecycleState: 'Published',
          },
        },
      }),
    ).toEqual(['/versions', 'version-1']);
  });

  it('falls back to the versions workspace when there is no active version', async () => {
    const fixture = TestBed.createComponent(ProcessListPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as ProcessListPageTestInstance;

    expect(
      component.openRoute({
        ...processRecord,
        governanceSummary: {
          ...processRecord.governanceSummary,
          activeWorkflowVersion: null,
        },
      }),
    ).toEqual(['/processes', 'process-1', 'versions']);
    expect(
      component.workRoute({
        ...processRecord,
        governanceSummary: {
          ...processRecord.governanceSummary,
          activeWorkflowVersion: null,
        },
      }),
    ).toBeNull();
  });

  it('allows process maintenance only for editors on the same team', async () => {
    currentUserState.set({
      id: 'editor-1',
      name: 'Eve Editor',
      email: 'eve@example.com',
      role: { id: 'role-1', name: 'EDITOR' },
      team: { id: 'team-1', code: 'OPS', name: 'Operations' },
    });

    const fixture = TestBed.createComponent(ProcessListPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as ProcessListPageTestInstance;

    expect(component.canManageProcess(processRecord)).toBeTrue();
    expect(
      component.canManageProcess({
        ...processRecord,
        teamId: 'team-2',
        teamName: 'Finance',
      }),
    ).toBeFalse();
  });
});
