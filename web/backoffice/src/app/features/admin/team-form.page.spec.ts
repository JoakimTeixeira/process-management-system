import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { createSpyObject, type SpyObject } from '../../../testing/spy-object';
import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { ToastService } from '../../core/toast/toast.service';
import { TeamFormPageComponent } from './team-form.page';

interface TeamFormPageTestInstance {
  form: TeamFormPageComponent['form'];
  team: TeamFormPageComponent['team'];
  isEdit: TeamFormPageComponent['isEdit'];
}

describe('TeamFormPageComponent', () => {
  let api: SpyObject<BackofficeApiService>;
  let toast: SpyObject<ToastService>;

  beforeEach(async () => {
    api = createSpyObject<BackofficeApiService>([
      'getTeam',
      'createTeam',
      'updateTeam',
      'deactivateTeam',
    ]);
    toast = createSpyObject<ToastService>(['success', 'error']);

    api.getTeam.mockReturnValue(
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

  it('should load team data in edit mode and allow deactivation', async () => {
    api.deactivateTeam.mockReturnValue(
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
    expect(component.isEdit()).toBe(true);
    expect(component.team()?.isActive).toBe(true);
    expect(component.form.getRawValue()).toEqual({
      code: 'OPS',
      name: 'Operations',
      description: 'Operations team',
    });

    await (
      fixture.componentInstance as unknown as { deactivateTeam: () => Promise<void> }
    ).deactivateTeam();

    expect(api.deactivateTeam).toHaveBeenCalledWith('team-1');
    expect(component.team()?.isActive).toBe(false);
    expect(toast.success).toHaveBeenCalledWith('Team deactivated successfully');
  });

  it('should send a create payload from create mode', async () => {
    api.createTeam.mockReturnValue(
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

  it('should send only changed fields when updating an existing team', async () => {
    api.updateTeam.mockReturnValue(
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
