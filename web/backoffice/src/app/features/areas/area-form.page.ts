import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { BreadcrumbService } from '../../core/navigation/breadcrumb.service';
import { AreaRecord, ItilPractice } from '../../core/models/backoffice.models';
import { getHttpErrorMessage } from '../../core/http/http-error-message';
import { ToastService } from '../../core/toast/toast.service';
import {
  bindFormPageLifecycle,
  createTeamOwnerDropdown,
} from '../../core/ui/team-owner-dropdown.util';

@Component({
  selector: 'app-area-form-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './area-form.page.html',
  styleUrl: './area-form.page.scss',
})
export class AreaFormPageComponent {
  readonly id = input<string>();

  private readonly api = inject(BackofficeApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breadcrumbOwner = Symbol('area-form-page');

  protected readonly practices = signal<ItilPractice[]>([]);
  protected readonly areaCode = signal<string | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly pageTitle = computed(() => (this.id() ? 'Edit area' : 'Create area'));

  protected readonly form = this.fb.group({
    itilPracticeId: ['', [Validators.required]],
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    teamId: ['', [Validators.required]],
    ownerId: [{ value: '', disabled: true }, [Validators.required]],
  });

  private readonly dropdown = createTeamOwnerDropdown(
    this.form.controls.teamId,
    this.form.controls.ownerId,
    (teamId) => this.api.listOwnerOptions(teamId),
  );

  protected readonly teams = this.dropdown.teams;
  protected readonly owners = this.dropdown.owners;
  protected readonly filteredOwners = this.dropdown.filteredOwners;
  protected readonly ownerLoadError = this.dropdown.ownerLoadError;
  protected readonly selectedTeamId = this.dropdown.selectedTeamId;

  constructor() {
    bindFormPageLifecycle(
      this.destroyRef,
      this.breadcrumbs,
      this.breadcrumbOwner,
      () => void this.loadPage(this.id()),
    );
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    try {
      const payload = {
        title: this.form.controls.title.getRawValue(),
        description: this.form.controls.description.getRawValue(),
        teamId: this.form.controls.teamId.getRawValue(),
        ownerId: this.form.controls.ownerId.getRawValue(),
        itilPracticeId: this.form.controls.itilPracticeId.getRawValue(),
      };

      if (this.id()) {
        await firstValueFrom(this.api.updateArea(this.id()!, payload));
        this.toast.success('Area updated successfully');
      } else {
        await firstValueFrom(this.api.createArea(payload));
        this.toast.success('Area created successfully');
      }

      await this.router.navigateByUrl('/areas');
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to save the area.'));
      this.toast.error('Failed to save area');
    } finally {
      this.isSaving.set(false);
    }
  }

  private async loadPage(areaId: string | undefined): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.dropdown.resetLoadState();

    try {
      const [teams, practices, area] = await Promise.all([
        firstValueFrom(this.api.listTeamOptions()),
        firstValueFrom(this.api.listItilPractices()),
        areaId ? firstValueFrom(this.api.getArea(areaId)) : Promise.resolve<AreaRecord | null>(null),
      ]);

      this.teams.set(teams);
      this.practices.set(practices);
      this.areaCode.set(area?.code ?? null);
      if (area) {
        this.breadcrumbs.setOverride(this.breadcrumbOwner, [
          { label: 'Areas', url: '/areas' },
          { label: area.title },
          { label: 'Edit area' },
        ]);
      }

      await this.dropdown.bindTeamAndLoadOwners(area?.teamId ?? '');

      this.form.reset(
        {
          title: area?.title ?? '',
          description: area?.description ?? '',
          teamId: area?.teamId ?? '',
          ownerId: area?.ownerId ?? '',
          itilPracticeId: area?.itilPracticeId ?? '',
        },
        { emitEvent: false },
      );
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load the area form.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}
