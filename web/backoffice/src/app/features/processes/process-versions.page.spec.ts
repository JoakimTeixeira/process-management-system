import { Signal, signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { BreadcrumbService } from '../../core/navigation/breadcrumb.service';
import { ProcessVersionsPageComponent } from './process-versions.page';

interface ProcessVersionsPageTestInstance {
  process: ProcessVersionsPageComponent['process'];
  versions: ProcessVersionsPageComponent['versions'];
  canCreateVersion: ProcessVersionsPageComponent['canCreateVersion'];
}

describe('ProcessVersionsPageComponent', () => {
  let api: jasmine.SpyObj<BackofficeApiService>;
  let currentUserState: ReturnType<typeof signal<{
    id: string;
    name: string;
    email: string;
    role: { id: string; name: 'EDITOR' | 'REVIEWER' };
    team: { id: string; code: string; name: string };
  }>>;
  let auth: {
    hasRole: jasmine.Spy;
    currentUser: Signal<{
      id: string;
      name: string;
      email: string;
      role: { id: string; name: 'EDITOR' | 'REVIEWER' };
      team: { id: string; code: string; name: string };
    }>;
  };

  beforeEach(async () => {
    api = jasmine.createSpyObj<BackofficeApiService>('BackofficeApiService', [
      'getProcess',
      'listProcessVersions',
    ]);

    api.getProcess.and.returnValue(
      of({
        id: 'process-1',
        areaId: 'area-1',
        code: 'P1',
        title: 'Change control',
        description: 'Process description',
        teamId: 'team-1',
        teamName: 'Operations',
        ownerId: 'owner-1',
        ownerName: 'Alice Owner',
      }),
    );
    api.listProcessVersions.and.returnValue(
      of([
        {
          id: 'version-1',
          processId: 'process-1',
          versionNumber: 1,
          lifecycleState: 'Published',
          architectureState: 'AS-IS',
          title: 'Current process',
          checklistCompleted: true,
          derivedFromVersionId: null,
          changeDescription: 'Live',
          reasonForChange: 'Published',
        },
        {
          id: 'version-2',
          processId: 'process-1',
          versionNumber: 2,
          lifecycleState: 'Draft',
          architectureState: 'TO-BE',
          title: 'Future process',
          checklistCompleted: false,
          derivedFromVersionId: 'version-1',
          changeDescription: 'Change',
          reasonForChange: 'Reason',
        },
      ]),
    );

    currentUserState = signal({
      id: 'editor-1',
      name: 'Eve Editor',
      email: 'eve@example.com',
      role: { id: 'role-1', name: 'EDITOR' as const },
      team: { id: 'team-1', code: 'OPS', name: 'Operations' },
    });

    auth = {
      hasRole: jasmine
        .createSpy('hasRole')
        .and.callFake((role: string) => currentUserState().role.name === role),
      currentUser: currentUserState.asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [ProcessVersionsPageComponent, NoopAnimationsModule],
      providers: [
        { provide: BackofficeApiService, useValue: api },
        { provide: AuthService, useValue: auth },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('allows creating versions only for editors on the same team', async () => {
    const fixture = TestBed.createComponent(ProcessVersionsPageComponent);
    fixture.componentRef.setInput('id', 'process-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as ProcessVersionsPageTestInstance;

    expect(component.process()?.teamId).toBe('team-1');
    expect(component.versions().map((version: { versionNumber: number }) => version.versionNumber)).toEqual([2, 1]);
    expect(component.canCreateVersion()).toBeTrue();
    expect(TestBed.inject(BreadcrumbService).items()).toEqual([
      { label: 'Processes', url: '/processes' },
      { label: 'Change control' },
      { label: 'Versions' },
    ]);
  });

  it('blocks creating versions for editors outside the process team', async () => {
    currentUserState.set({
      id: 'editor-2',
      name: 'Finley Editor',
      email: 'finley@example.com',
      role: { id: 'role-1', name: 'EDITOR' },
      team: { id: 'team-2', code: 'FIN', name: 'Finance' },
    });

    const fixture = TestBed.createComponent(ProcessVersionsPageComponent);
    fixture.componentRef.setInput('id', 'process-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as ProcessVersionsPageTestInstance;

    expect(component.canCreateVersion()).toBeFalse();
  });
});
