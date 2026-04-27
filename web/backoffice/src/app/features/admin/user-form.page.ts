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
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  styles: [
    `
      :host {
        display: block;
      }

      .page {
        max-width: 52rem;
      }
    `,
  ],
  template: `
    <section class="page">
      <section class="bo-page-intro">
      <div class="bo-page-intro__copy">
        <h1>{{ pageTitle() }}</h1>
      </div>
      </section>

      @if (isLoading()) {
        <section class="center-state bo-state-card">
          <mat-progress-spinner mode="indeterminate" />
        </section>
      } @else {
        <mat-card appearance="outlined">
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="submit()">
              <mat-form-field appearance="outline">
                <mat-label>Name</mat-label>
                <input matInput formControlName="name" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Role</mat-label>
                <mat-select formControlName="roleName">
                  @for (role of roles; track role) {
                    <mat-option [value]="role">{{ role }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Team</mat-label>
                <mat-select formControlName="teamId">
                  @for (team of teams(); track team.id) {
                    <mat-option [value]="team.id">{{ team.code }} - {{ team.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              @if (!isEdit()) {
                <mat-form-field appearance="outline">
                  <mat-label>Initial password</mat-label>
                  <input matInput type="password" formControlName="password" />
                </mat-form-field>
              }

              @if (isEdit()) {
                <mat-checkbox formControlName="isActive">User is active</mat-checkbox>
              }

              @if (formErrorMessage(); as formErrorMessage) {
                <p class="error-message">{{ formErrorMessage }}</p>
              }

              <div class="bo-form-actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="isSaving()">
                  <mat-icon>save</mat-icon>
                  Save user
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        @if (isEdit()) {
          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-card-title>Technical actions</mat-card-title>
              <mat-card-subtitle>Governance workflow authority is not managed here.</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="resetPasswordForm" (ngSubmit)="resetPassword()">
                <mat-form-field appearance="outline">
                  <mat-label>Temporary password</mat-label>
                  <input matInput type="password" formControlName="newPassword" />
                </mat-form-field>

                @if (resetPasswordErrorMessage(); as resetPasswordErrorMessage) {
                  <p class="error-message">{{ resetPasswordErrorMessage }}</p>
                }

                <div class="card-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="isResettingPassword()">
                    <mat-icon>password</mat-icon>
                    Reset password
                  </button>
                  @if (user()?.isActive) {
                    <button mat-button type="button" (click)="deactivateUser()" [disabled]="isDeactivating()">
                      <mat-icon>person_off</mat-icon>
                      Deactivate user
                    </button>
                  }
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        }
      }
    </section>
  `,
})
export class UserFormPageComponent {
  readonly id = input<string>();

  protected readonly roles = USER_ROLES;

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
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    effect(() => {
      void this.loadPage(this.id());
    });
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
        const payload = {
          name: this.form.controls.name.getRawValue(),
          email: this.form.controls.email.getRawValue(),
          roleName: this.form.controls.roleName.getRawValue(),
          teamId: this.form.controls.teamId.getRawValue() || undefined,
          isActive: this.form.controls.isActive.getRawValue(),
        };
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
      this.resetPasswordErrorMessage.set('Enter a temporary password with at least 8 characters.');
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
}
