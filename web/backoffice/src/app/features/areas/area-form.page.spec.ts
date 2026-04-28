import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AreaFormPageComponent } from './area-form.page';

interface AreaFormPageTestInstance {
  form: AreaFormPageComponent['form'];
  owners: AreaFormPageComponent['owners'];
  filteredOwners: AreaFormPageComponent['filteredOwners'];
  practices: AreaFormPageComponent['practices'];
  areaCode: AreaFormPageComponent['areaCode'];
  errorMessage: AreaFormPageComponent['errorMessage'];
  ownerLoadError: AreaFormPageComponent['ownerLoadError'];
}

describe('AreaFormPageComponent', () => {
  let api: jasmine.SpyObj<BackofficeApiService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj<BackofficeApiService>('BackofficeApiService', [
      'listTeamOptions',
      'listOwnerOptions',
      'listItilPractices',
      'getArea',
      'createArea',
      'updateArea',
    ]);

    api.listTeamOptions.and.returnValue(
      of([{ id: 'team-1', code: 'OPS', name: 'Operations' }]),
    );
    api.listOwnerOptions.and.returnValue(
      of([{ id: 'owner-1', name: 'Alice Owner', teamId: 'team-1', isActive: true }]),
    );
    api.listItilPractices.and.returnValue(
      of([{ id: 'practice-1', code: 'PR1', name: 'Incident', description: null }]),
    );
    api.getArea.and.returnValue(
      of({
        id: 'area-1',
        code: 'A1',
        title: 'Operations',
        description: 'Area description',
        teamId: 'team-1',
        teamName: 'Operations',
        ownerId: 'owner-1',
        ownerName: 'Alice Owner',
        itilPracticeId: 'practice-1',
        itilPractice: { id: 'practice-1', name: 'Incident' },
      }),
    );

    await TestBed.configureTestingModule({
      imports: [AreaFormPageComponent],
      providers: [
        { provide: BackofficeApiService, useValue: api },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('should load edit-mode state and team-scoped owner options', async () => {
    const fixture = TestBed.createComponent(AreaFormPageComponent);

    fixture.componentRef.setInput('id', 'area-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as AreaFormPageTestInstance;

    expect(api.getArea).toHaveBeenCalledWith('area-1');
    expect(api.listOwnerOptions).toHaveBeenCalledWith('team-1');
    expect(component.form.getRawValue()).toEqual({
      title: 'Operations',
      description: 'Area description',
      teamId: 'team-1',
      ownerId: 'owner-1',
      itilPracticeId: 'practice-1',
    });
    expect(component.form.controls.ownerId.enabled).toBeTrue();
    expect(component.owners()).toEqual([
      { id: 'owner-1', name: 'Alice Owner', teamId: 'team-1', isActive: true },
    ]);
    expect(component.filteredOwners()).toEqual([
      { id: 'owner-1', name: 'Alice Owner', teamId: 'team-1', isActive: true },
    ]);
    expect(component.practices().map((practice: { name: string }) => practice.name)).toEqual([
      'Incident',
    ]);
    expect(component.areaCode()).toBe('A1');
  });

  it('should keep owner disabled until a team is selected', async () => {
    const fixture = TestBed.createComponent(AreaFormPageComponent);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as AreaFormPageTestInstance;

    expect(component.form.controls.ownerId.disabled).toBeTrue();
    expect(api.listOwnerOptions).not.toHaveBeenCalled();

    component.form.controls.teamId.setValue('team-1');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.form.controls.ownerId.enabled).toBeTrue();
    expect(api.listOwnerOptions).toHaveBeenCalledWith('team-1');
  });

  it('should keep owner load failures scoped to owner-loading state', async () => {
    api.listOwnerOptions.and.returnValue(
      throwError(() => new Error('Cannot GET /users/owner-options/team/team-1')),
    );

    const fixture = TestBed.createComponent(AreaFormPageComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as AreaFormPageTestInstance;
    component.form.controls.teamId.setValue('team-1');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.errorMessage()).toBeNull();
    expect(component.ownerLoadError()).toBe('Unable to load owners for the selected team.');
    expect(component.owners()).toEqual([]);
  });

  it('should keep teamId enabled in edit mode (unlike process-form where it is locked)', async () => {
    const fixture = TestBed.createComponent(AreaFormPageComponent);

    fixture.componentRef.setInput('id', 'area-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as AreaFormPageTestInstance;

    expect(component.form.controls.teamId.enabled).toBeTrue();
    expect(component.form.controls.teamId.value).toBe('team-1');
  });
});
