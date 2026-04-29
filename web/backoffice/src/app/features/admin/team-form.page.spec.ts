import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { ToastService } from '../../core/toast/toast.service';
import { TeamFormPageComponent } from './team-form.page';

interface TeamFormPageTestInstance {
  form: TeamFormPageComponent['form'];
  team: TeamFormPageComponent['team'];
  isEdit: TeamFormPageComponent['isEdit'];
}

describe('TeamFormPageComponent', () => {
  let api: jasmine.SpyObj<BackofficeApiService>;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj<BackofficeApiService>('BackofficeApiService', [
      'getTeam',
      'createTeam',
      'updateTeam',
      'deactivateTeam',
    ]);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['success', 'error']);

    api.getTeam.and.returnValue(
      of({
        id: 'team-1',
        code: 'OPS',
        name: 'Operations',
        description: 'Operations team',
        isActive: true,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [TeamFormPageComponent],
      providers: [
        { provide: BackofficeApiService, useValue: api },
        { provide: ToastService, useValue: toast },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('loads team data in edit mode and allows deactivation', async () => {
    api.deactivateTeam.and.returnValue(
      of({
        id: 'team-1',
        code: 'OPS',
        name: 'Operations',
        description: 'Operations team',
        isActive: false,
      }),
    );

    const fixture = TestBed.createComponent(TeamFormPageComponent);
    fixture.componentRef.setInput('id', 'team-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as TeamFormPageTestInstance;

    expect(api.getTeam).toHaveBeenCalledWith('team-1');
    expect(component.isEdit()).toBeTrue();
    expect(component.team()?.isActive).toBeTrue();
    expect(component.form.getRawValue()).toEqual({
      code: 'OPS',
      name: 'Operations',
      description: 'Operations team',
    });

    await (fixture.componentInstance as unknown as { deactivateTeam: () => Promise<void> }).deactivateTeam();

    expect(api.deactivateTeam).toHaveBeenCalledWith('team-1');
    expect(component.team()?.isActive).toBeFalse();
    expect(toast.success).toHaveBeenCalledWith('Team deactivated successfully');
  });

  it('sends a create payload from create mode', async () => {
    api.createTeam.and.returnValue(
      of({
        id: 'team-2',
        code: 'ENG',
        name: 'Engineering',
        description: 'Engineering team',
        isActive: true,
      }),
    );

    const fixture = TestBed.createComponent(TeamFormPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as TeamFormPageTestInstance;

    component.form.setValue({
      code: 'ENG',
      name: 'Engineering',
      description: 'Engineering team',
    });

    await (fixture.componentInstance as unknown as { submit: () => Promise<void> }).submit();

    expect(api.createTeam).toHaveBeenCalledWith({
      code: 'ENG',
      name: 'Engineering',
      description: 'Engineering team',
    });
    expect(toast.success).toHaveBeenCalledWith('Team created successfully');
  });

  it('sends only changed fields when updating an existing team', async () => {
    api.updateTeam.and.returnValue(
      of({
        id: 'team-1',
        code: 'OPS',
        name: 'Operations and Support',
        description: 'Operations team',
        isActive: true,
      }),
    );

    const fixture = TestBed.createComponent(TeamFormPageComponent);
    fixture.componentRef.setInput('id', 'team-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as TeamFormPageTestInstance;
    component.form.patchValue({ name: 'Operations and Support' });

    await (fixture.componentInstance as unknown as { submit: () => Promise<void> }).submit();

    expect(api.updateTeam).toHaveBeenCalledWith('team-1', {
      name: 'Operations and Support',
    });
    expect(toast.success).toHaveBeenCalledWith('Team updated successfully');
  });
});
