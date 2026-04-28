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
      imports: [UserFormPageComponent],
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

  it('shows password requirements for create mode and blocks weak passwords', async () => {
    const fixture = TestBed.createComponent(UserFormPageComponent);

    api.createUser.and.returnValue(
      of({
        id: 'user-2',
        name: 'Alice Editor',
        email: 'alice@example.com',
        isActive: true,
        role: { id: 'role-2', name: 'EDITOR' },
        team: { id: 'team-2', code: 'HR', name: 'Human Resources' },
      }),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as UserFormPageTestInstance;
    const pageText = fixture.nativeElement.textContent as string;

    expect(pageText).toContain('Password requirements');
    expect(pageText).toContain('At least 15 characters');
    expect(pageText).toContain('At least 1 uppercase letter');
    expect(pageText).toContain('At least 1 lowercase letter');
    expect(pageText).toContain('At least 1 number');
    expect(pageText).toContain('At least 1 special character');

    component.form.setValue({
      name: 'Alice Editor',
      email: 'alice@example.com',
      roleName: 'EDITOR',
      teamId: 'team-2',
      password: 'weakpass',
      isActive: true,
    });

    await (fixture.componentInstance as unknown as { submit: () => Promise<void> }).submit();
    fixture.detectChanges();

    expect(api.createUser).not.toHaveBeenCalled();
    expect(component.form.controls.password.invalid).toBeTrue();
  });

  it('shows reset password requirements and blocks weak temporary passwords', async () => {
    const fixture = TestBed.createComponent(UserFormPageComponent);

    fixture.componentRef.setInput('id', 'user-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as UserFormPageTestInstance;
    const pageText = fixture.nativeElement.textContent as string;

    expect(pageText).toContain('Temporary password requirements');

    component.resetPasswordForm.controls.newPassword.setValue('weakpass');

    await (
      fixture.componentInstance as unknown as { resetPassword: () => Promise<void> }
    ).resetPassword();
    fixture.detectChanges();

    expect(api.resetUserPassword).not.toHaveBeenCalled();
    expect(component.resetPasswordForm.controls.newPassword.invalid).toBeTrue();
  });

  it('only sends changed fields when reactivating an existing user', async () => {
    const fixture = TestBed.createComponent(UserFormPageComponent);

    api.getUser.and.returnValue(
      of({
        id: 'user-2',
        name: 'Peter Publisher',
        email: 'peter.publisher@entity.gov',
        isActive: false,
        role: { id: 'role-3', name: 'PUBLISHER' },
        team: { id: 'team-2', code: 'HR', name: 'Human Resources' },
      }),
    );
    api.updateUser.and.returnValue(
      of({
        id: 'user-2',
        name: 'Peter Publisher',
        email: 'peter.publisher@entity.gov',
        isActive: true,
        role: { id: 'role-3', name: 'PUBLISHER' },
        team: { id: 'team-2', code: 'HR', name: 'Human Resources' },
      }),
    );

    fixture.componentRef.setInput('id', 'user-2');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as UserFormPageTestInstance;
    component.form.patchValue({ isActive: true });

    await (fixture.componentInstance as unknown as { submit: () => Promise<void> }).submit();

    expect(api.updateUser).toHaveBeenCalledWith('user-2', { isActive: true });
  });
});
