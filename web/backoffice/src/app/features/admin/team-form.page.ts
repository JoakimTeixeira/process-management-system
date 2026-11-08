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
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { TeamRecord } from '../../core/models/backoffice.models';
import { getHttpErrorMessage } from '../../core/http/http-error-message';
import { ToastService } from '../../core/toast/toast.service';

const MAX_TEAM_CODE_LENGTH = 50;
const MAX_TEAM_NAME_LENGTH = 255;
const MAX_TEAM_DESCRIPTION_LENGTH = 255;

@Component({
  selector: 'app-team-form-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './team-form.page.html',
  styleUrl: './team-form.page.scss',
})
export class TeamFormPageComponent {
  readonly id = input<string>();

  private readonly api = inject(BackofficeApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly team = signal<TeamRecord | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly isDeactivating = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly pageTitle = computed(() => (this.id() ? 'Edit team' : 'Create team'));
  protected readonly isEdit = computed(() => Boolean(this.id()));

  protected readonly form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(MAX_TEAM_CODE_LENGTH)]],
    name: ['', [Validators.required, Validators.maxLength(MAX_TEAM_NAME_LENGTH)]],
    description: ['', [Validators.required, Validators.maxLength(MAX_TEAM_DESCRIPTION_LENGTH)]],
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
    this.errorMessage.set(null);

    try {
      if (this.id()) {
        const payload = this.buildUpdatePayload();
        await firstValueFrom(this.api.updateTeam(this.id()!, payload));
        this.toast.success('Team updated successfully');
      } else {
        await firstValueFrom(
          this.api.createTeam({
            code: this.form.controls.code.getRawValue(),
            name: this.form.controls.name.getRawValue(),
            description: this.form.controls.description.getRawValue(),
          }),
        );
        this.toast.success('Team created successfully');
      }

      await this.router.navigateByUrl('/admin/teams');
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to save the team.'));
      this.toast.error('Failed to save team');
    } finally {
      this.isSaving.set(false);
    }
  }

  protected async deactivateTeam(): Promise<void> {
    if (!this.id() || !this.team()?.isActive) {
      return;
    }

    this.isDeactivating.set(true);
    this.errorMessage.set(null);

    try {
      const updatedTeam = await firstValueFrom(this.api.deactivateTeam(this.id()!));
      this.team.set(updatedTeam);
      this.toast.success('Team deactivated successfully');
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to deactivate the team.'));
      this.toast.error('Failed to deactivate team');
    } finally {
      this.isDeactivating.set(false);
    }
  }

  private buildUpdatePayload(): Partial<{
    code: string;
    name: string;
    description: string;
  }> {
    const currentTeam = this.team();
    const formValue = this.form.getRawValue();

    if (!currentTeam) {
      return {
        code: formValue.code,
        name: formValue.name,
        description: formValue.description,
      };
    }

    const payload: Partial<{
      code: string;
      name: string;
      description: string;
    }> = {};

    if (formValue.code !== currentTeam.code) {
      payload.code = formValue.code;
    }

    if (formValue.name !== currentTeam.name) {
      payload.name = formValue.name;
    }

    if (formValue.description !== currentTeam.description) {
      payload.description = formValue.description;
    }

    return payload;
  }

  private async loadPage(teamId: string | undefined): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const team = teamId ? await firstValueFrom(this.api.getTeam(teamId)) : null;

      this.team.set(team);
      this.form.reset({
        code: team?.code ?? '',
        name: team?.name ?? '',
        description: team?.description ?? '',
      });
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load the team.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}
