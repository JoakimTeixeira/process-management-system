import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { VersionFormPageComponent } from './version-form.page';

interface VersionFormPageTestInstance {
  form: VersionFormPageComponent['form'];
  existingVersions: VersionFormPageComponent['existingVersions'];
  canCreateVersion: VersionFormPageComponent['canCreateVersion'];
  errorMessage: VersionFormPageComponent['errorMessage'];
  submit: VersionFormPageComponent['submit'];
}

describe('VersionFormPageComponent', () => {
  let api: jasmine.SpyObj<BackofficeApiService>;
  let auth: {
    currentUser: () => {
      id: string;
      name: string;
      email: string;
      role: { id: string; name: 'EDITOR' };
      team: { id: string; code: string; name: string };
    };
  };

  beforeEach(async () => {
    api = jasmine.createSpyObj<BackofficeApiService>('BackofficeApiService', [
      'getProcess',
      'listProcessVersions',
      'createProcessVersion',
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
      ]),
    );
    api.createProcessVersion.and.returnValue(
      of({
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
      }),
    );

    auth = {
      currentUser: () => ({
        id: 'editor-1',
        name: 'Eve Editor',
        email: 'eve@example.com',
        role: { id: 'role-1', name: 'EDITOR' },
        team: { id: 'team-1', code: 'OPS', name: 'Operations' },
      }),
    };

    await TestBed.configureTestingModule({
      imports: [VersionFormPageComponent, NoopAnimationsModule],
      providers: [
        { provide: BackofficeApiService, useValue: api },
        { provide: AuthService, useValue: auth },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('creates versions without exposing version-number input to the client payload', async () => {
    const fixture = TestBed.createComponent(VersionFormPageComponent);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    fixture.componentRef.setInput('id', 'process-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as VersionFormPageTestInstance;
    component.form.setValue({
      architectureState: 'TO-BE',
      title: 'Future process',
      derivedFromVersionId: 'version-1',
      changeDescription: 'Change',
      reasonForChange: 'Reason',
    });

    await component.submit();

    expect(component.canCreateVersion()).toBeTrue();
    expect(component.existingVersions().length).toBe(1);
    expect(api.createProcessVersion).toHaveBeenCalledWith('process-1', {
      architectureState: 'TO-BE',
      title: 'Future process',
      derivedFromVersionId: 'version-1',
      changeDescription: 'Change',
      reasonForChange: 'Reason',
    });
  });

  it('blocks version creation for editors outside the process team', async () => {
    auth.currentUser = () => ({
      id: 'editor-2',
      name: 'Finley Editor',
      email: 'finley@example.com',
      role: { id: 'role-1', name: 'EDITOR' },
      team: { id: 'team-2', code: 'FIN', name: 'Finance' },
    });

    const fixture = TestBed.createComponent(VersionFormPageComponent);
    fixture.componentRef.setInput('id', 'process-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as VersionFormPageTestInstance;
    await component.submit();

    expect(component.canCreateVersion()).toBeFalse();
    expect(component.errorMessage()).toBe('You can only create versions for processes owned by your team.');
    expect(api.createProcessVersion).not.toHaveBeenCalled();
  });
});
