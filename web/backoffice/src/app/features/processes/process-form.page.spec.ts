import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { ProcessFormPageComponent } from './process-form.page';

interface ProcessFormPageTestInstance {
  form: ProcessFormPageComponent['form'];
  areas: ProcessFormPageComponent['areas'];
  owners: ProcessFormPageComponent['owners'];
  filteredOwners: ProcessFormPageComponent['filteredOwners'];
  availableTeams: ProcessFormPageComponent['availableTeams'];
  canManageProcess: ProcessFormPageComponent['canManageProcess'];
  processCode: ProcessFormPageComponent['processCode'];
  errorMessage: ProcessFormPageComponent['errorMessage'];
  ownerLoadError: ProcessFormPageComponent['ownerLoadError'];
}

describe('ProcessFormPageComponent', () => {
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
      'listAreas',
      'listTeamOptions',
      'listOwnerOptions',
      'getProcess',
      'createProcess',
      'updateProcess',
    ]);

    api.listAreas.and.returnValue(
      of([
        {
          id: 'area-1',
          code: 'A1',
          title: 'Operations',
          description: null,
          teamId: 'team-1',
          teamName: 'Operations',
          ownerId: 'owner-1',
          ownerName: 'Alice Owner',
          itilPracticeId: 'practice-1',
          itilPractice: { id: 'practice-1', name: 'Incident' },
        },
      ]),
    );
    api.listTeamOptions.and.returnValue(
      of([{ id: 'team-1', code: 'OPS', name: 'Operations' }]),
    );
    api.listOwnerOptions.and.returnValue(
      of([{ id: 'owner-2', name: 'Bob Owner', teamId: 'team-1' }]),
    );
    api.getProcess.and.returnValue(
      of({
        id: 'process-1',
        areaId: 'area-1',
        code: 'P1',
        title: 'Change control',
        description: 'Process description',
        teamId: 'team-1',
        teamName: 'Operations',
        ownerId: 'owner-2',
        ownerName: 'Bob Owner',
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
      imports: [ProcessFormPageComponent, NoopAnimationsModule],
      providers: [
        { provide: BackofficeApiService, useValue: api },
        { provide: AuthService, useValue: auth },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('should load edit-mode process data and team-scoped owner options', async () => {
    const fixture = TestBed.createComponent(ProcessFormPageComponent);

    fixture.componentRef.setInput('id', 'process-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as ProcessFormPageTestInstance;

    expect(api.getProcess).toHaveBeenCalledWith('process-1');
    expect(api.listOwnerOptions).toHaveBeenCalledWith('team-1');
    expect(component.form.getRawValue()).toEqual({
      title: 'Change control',
      description: 'Process description',
      areaId: 'area-1',
      teamId: 'team-1',
      ownerId: 'owner-2',
    });
    expect(component.areas().map((area: { title: string }) => area.title)).toEqual([
      'Operations',
    ]);
    expect(component.availableTeams().map((team: { id: string }) => team.id)).toEqual([
      'team-1',
    ]);
    expect(component.canManageProcess()).toBeTrue();
    expect(component.form.controls.teamId.disabled).toBeTrue();
    expect(component.form.controls.ownerId.enabled).toBeTrue();
    expect(component.owners()).toEqual([
      { id: 'owner-2', name: 'Bob Owner', teamId: 'team-1' },
    ]);
    expect(component.filteredOwners()).toEqual([
      { id: 'owner-2', name: 'Bob Owner', teamId: 'team-1' },
    ]);
    expect(component.processCode()).toBe('P1');
  });

  it('should lock new processes to the current editor team and load team owners', async () => {
    const fixture = TestBed.createComponent(ProcessFormPageComponent);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as ProcessFormPageTestInstance;

    expect(component.form.controls.teamId.getRawValue()).toBe('team-1');
    expect(component.form.controls.teamId.disabled).toBeTrue();
    expect(component.form.controls.ownerId.enabled).toBeTrue();
    expect(api.listOwnerOptions).toHaveBeenCalledWith('team-1');
  });

  it('should keep owner load failures scoped to owner-loading state', async () => {
    api.listOwnerOptions.and.returnValue(
      throwError(() => new Error('Cannot GET /users/owner-options/team/team-1')),
    );

    const fixture = TestBed.createComponent(ProcessFormPageComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as ProcessFormPageTestInstance;

    expect(component.errorMessage()).toBeNull();
    expect(component.ownerLoadError()).toBe('Unable to load owners for the selected team.');
    expect(component.owners()).toEqual([]);
  });

  it('should block editing processes owned by another team', async () => {
    api.getProcess.and.returnValue(
      of({
        id: 'process-1',
        areaId: 'area-1',
        code: 'P1',
        title: 'Change control',
        description: 'Process description',
        teamId: 'team-2',
        teamName: 'Finance',
        ownerId: 'owner-2',
        ownerName: 'Bob Owner',
      }),
    );

    const fixture = TestBed.createComponent(ProcessFormPageComponent);
    fixture.componentRef.setInput('id', 'process-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as ProcessFormPageTestInstance;

    expect(component.canManageProcess()).toBeFalse();
    expect(component.errorMessage()).toBe('You can only manage processes owned by your team.');
  });

  it('should lock teamId in edit mode (unlike area-form where it remains enabled)', async () => {
    const fixture = TestBed.createComponent(ProcessFormPageComponent);

    fixture.componentRef.setInput('id', 'process-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as ProcessFormPageTestInstance;

    expect(component.form.controls.teamId.disabled).toBeTrue();
    expect(component.form.controls.teamId.value).toBe('team-1');
  });
});
