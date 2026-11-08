import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AdminUser, AppRole, TeamOption } from '../../core/models/backoffice.models';
import { getHttpErrorMessage } from '../../core/http/http-error-message';
import { ToastService } from '../../core/toast/toast.service';

const USER_ROLES: AppRole[] = ['EDITOR', 'REVIEWER', 'PUBLISHER', 'VIEWER', 'SYSTEM_ADMIN'];
const MIN_PASSWORD_LENGTH = 15;
const PASSWORD_REQUIREMENTS_SUMMARY =
  'Use at least 15 characters with uppercase, lowercase, a number, and a special character.';

interface PasswordRule {
  readonly key: string;
  readonly label: string;
  readonly test: (value: string) => boolean;
}

const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    key: 'minLength',
    label: 'At least 15 characters',
    test: (value) => value.length >= MIN_PASSWORD_LENGTH,
  },
  {
    key: 'uppercase',
    label: 'At least 1 uppercase letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    key: 'lowercase',
    label: 'At least 1 lowercase letter',
    test: (value) => /[a-z]/.test(value),
  },
  {
    key: 'number',
    label: 'At least 1 number',
    test: (value) => /\d/.test(value),
  },
  {
    key: 'special',
    label: 'At least 1 special character',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

function passwordPolicyValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = control.value ?? '';

    if (!value) {
      return null;
    }

    const unmetRules = PASSWORD_RULES
      .filter((rule) => !rule.test(value))
      .map((rule) => rule.key);

    return unmetRules.length > 0 ? { passwordPolicy: unmetRules } : null;
  };
}

@Component({
  selector: 'app-user-form-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-form.page.html',
  styleUrl: './user-form.page.scss',
})
export class UserFormPageComponent {
  readonly id = input<string>();

  protected readonly roles = USER_ROLES;
  protected readonly passwordRules = PASSWORD_RULES;
  protected readonly passwordRequirementsSummary = PASSWORD_REQUIREMENTS_SUMMARY;

  private readonly api = inject(BackofficeApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly user = signal<AdminUser | null>(null);
  protected readonly teams = signal<TeamOption[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly isDeactivating = signal(false);
  protected readonly isResettingPassword = signal(false);
  protected readonly formErrorMessage = signal<string | null>(null);
  protected readonly resetPasswordErrorMessage = signal<string | null>(null);
  protected readonly isEdit = computed(() => Boolean(this.id()));
  protected readonly pageTitle = computed(() => (this.isEdit() ? 'Edit user' : 'Create user'));

  protected readonly form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    roleName: ['EDITOR' as AppRole, [Validators.required]],
    teamId: ['', [Validators.required]],
    password: [''],
    isActive: [true],
  });

  protected readonly resetPasswordForm = this.fb.group({
    newPassword: ['', [Validators.required, passwordPolicyValidator()]],
  });

  constructor() {
    effect(() => {
      const passwordControl = this.form.controls.password;

      if (this.isEdit()) {
        passwordControl.clearValidators();
      } else {
        passwordControl.setValidators([Validators.required, passwordPolicyValidator()]);
      }

      passwordControl.updateValueAndValidity({ emitEvent: false });
    });

    effect(() => {
      void this.loadPage(this.id());
    });
  }

  protected passwordRuleMet(value: string, rule: PasswordRule): boolean {
    return rule.test(value ?? '');
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.formErrorMessage.set(null);

    try {
      if (this.id()) {
        const payload = this.buildUpdatePayload();
        await firstValueFrom(this.api.updateUser(this.id()!, payload));
        this.toast.success('User updated successfully');
      } else {
        const payload = {
          name: this.form.controls.name.getRawValue(),
          email: this.form.controls.email.getRawValue(),
          roleName: this.form.controls.roleName.getRawValue(),
          teamId: this.form.controls.teamId.getRawValue(),
          password: this.form.controls.password.getRawValue(),
        };
        await firstValueFrom(this.api.createUser(payload));
        this.toast.success('User created successfully');
      }

      await this.router.navigateByUrl('/admin/users');
    } catch (error) {
      this.formErrorMessage.set(getHttpErrorMessage(error, 'Unable to save the user.'));
      this.toast.error('Failed to save user');
    } finally {
      this.isSaving.set(false);
    }
  }

  private buildUpdatePayload(): Partial<{
    name: string;
    email: string;
    roleName: AppRole;
    teamId: string;
    isActive: boolean;
  }> {
    const currentUser = this.user();
    const formValue = this.form.getRawValue();

    if (!currentUser) {
      return {
        name: formValue.name,
        email: formValue.email,
        roleName: formValue.roleName,
        teamId: formValue.teamId || undefined,
        isActive: formValue.isActive,
      };
    }

    const payload: Partial<{
      name: string;
      email: string;
      roleName: AppRole;
      teamId: string;
      isActive: boolean;
    }> = {};

    if (formValue.name !== currentUser.name) {
      payload.name = formValue.name;
    }

    if (formValue.email !== currentUser.email) {
      payload.email = formValue.email;
    }

    if (formValue.roleName !== currentUser.role.name) {
      payload.roleName = formValue.roleName;
    }

    if (formValue.teamId !== currentUser.team.id) {
      payload.teamId = formValue.teamId || undefined;
    }

    if (formValue.isActive !== currentUser.isActive) {
      payload.isActive = formValue.isActive;
    }

    return payload;
  }

  protected async deactivateUser(): Promise<void> {
    if (!this.id()) {
      return;
    }

    this.isDeactivating.set(true);
    this.formErrorMessage.set(null);

    try {
      const updatedUser = await firstValueFrom(this.api.deactivateUser(this.id()!));
      this.user.set(updatedUser);
      this.form.patchValue({ isActive: updatedUser.isActive });
      this.toast.success('User deactivated successfully');
    } catch (error) {
      this.formErrorMessage.set(getHttpErrorMessage(error, 'Unable to deactivate the user.'));
      this.toast.error('Failed to deactivate user');
    } finally {
      this.isDeactivating.set(false);
    }
  }

  protected async resetPassword(): Promise<void> {
    if (!this.id() || this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      this.resetPasswordErrorMessage.set(PASSWORD_REQUIREMENTS_SUMMARY);
      return;
    }

    this.isResettingPassword.set(true);
    this.resetPasswordErrorMessage.set(null);

    try {
      const updatedUser = await firstValueFrom(
        this.api.resetUserPassword(
          this.id()!,
          this.resetPasswordForm.controls.newPassword.getRawValue(),
        ),
      );
      this.user.set(updatedUser);
      this.resetPasswordForm.reset({ newPassword: '' });
      this.toast.success('Password reset successfully');
    } catch (error) {
      this.resetPasswordErrorMessage.set(
        getHttpErrorMessage(error, 'Unable to reset the password.'),
      );
      this.toast.error('Failed to reset password');
    } finally {
      this.isResettingPassword.set(false);
    }
  }

  private async loadPage(userId: string | undefined): Promise<void> {
    this.isLoading.set(true);
    this.formErrorMessage.set(null);
    this.resetPasswordErrorMessage.set(null);

    try {
      const [teams, user] = await Promise.all([
        firstValueFrom(this.api.listTeamOptions()),
        userId ? firstValueFrom(this.api.getUser(userId)) : Promise.resolve<AdminUser | null>(null),
      ]);

      this.teams.set(teams);
      this.user.set(user);
      this.form.reset({
        name: user?.name ?? '',
        email: user?.email ?? '',
        roleName: user?.role.name ?? 'EDITOR',
        teamId: user?.team.id ?? '',
        password: '',
        isActive: user?.isActive ?? true,
      });
    } catch (error) {
      this.formErrorMessage.set(getHttpErrorMessage(error, 'Unable to load the user form.'));
    } finally {
      this.isLoading.set(false);
    }
  }

  protected formatRoleName(roleName: string): string {
    // Convert role names from underscores to spaces (e.g., "SYSTEM_ADMIN" -> "System Admin")
    return roleName
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
