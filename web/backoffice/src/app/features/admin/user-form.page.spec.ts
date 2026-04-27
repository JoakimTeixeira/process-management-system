import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { UserFormPageComponent } from './user-form.page';

interface UserFormPageTestInstance {
  form: UserFormPageComponent['form'];
  teams: UserFormPageComponent['teams'];
  user: UserFormPageComponent['user'];
  isEdit: UserFormPageComponent['isEdit'];
  resetPasswordForm: UserFormPageComponent['resetPasswordForm'];
}

describe('UserFormPageComponent', () => {
  let api: jasmine.SpyObj<BackofficeApiService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj<BackofficeApiService>('BackofficeApiService', [
      'listTeamOptions',
      'getUser',
      'createUser',
      'updateUser',
      'deactivateUser',
      'resetUserPassword',
    ]);

    api.listTeamOptions.and.returnValue(
      of([
        { id: 'team-1', code: 'OPS', name: 'Operations' },
        { id: 'team-2', code: 'HR', name: 'Human Resources' },
      ]),
    );
    api.getUser.and.returnValue(
      of({
        id: 'user-1',
        name: 'Sam Admin',
        email: 'sam@example.com',
        isActive: true,
        role: { id: 'role-1', name: 'SYSTEM_ADMIN' },
        team: { id: 'team-1', code: 'OPS', name: 'Operations' },
      }),
    );

    await TestBed.configureTestingModule({
      imports: [UserFormPageComponent, NoopAnimationsModule],
      providers: [
        { provide: BackofficeApiService, useValue: api },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('loads team and role values for edit mode', async () => {
    const fixture = TestBed.createComponent(UserFormPageComponent);

    fixture.componentRef.setInput('id', 'user-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as UserFormPageTestInstance;

    expect(api.getUser).toHaveBeenCalledWith('user-1');
    expect(component.isEdit()).toBeTrue();
    expect(component.user()?.id).toBe('user-1');
    expect(component.form.getRawValue()).toEqual({
      name: 'Sam Admin',
      email: 'sam@example.com',
      roleName: 'SYSTEM_ADMIN',
      teamId: 'team-1',
      password: '',
      isActive: true,
    });
    expect(component.teams().map((team: { code: string }) => team.code)).toEqual([
      'OPS',
      'HR',
    ]);
    expect(component.resetPasswordForm.controls.newPassword.enabled).toBeTrue();
  });
});
