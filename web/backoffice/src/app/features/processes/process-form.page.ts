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
import { AccessControlUtil } from '../../core/governance/access-control.util';
import { BreadcrumbService } from '../../core/navigation/breadcrumb.service';
import { AreaRecord, ProcessRecord } from '../../core/models/backoffice.models';
import { getHttpErrorMessage } from '../../core/http/http-error-message';
import { ToastService } from '../../core/toast/toast.service';
import {
  bindFormPageLifecycle,
  createTeamOwnerDropdown,
} from '../../core/ui/team-owner-dropdown.util';

@Component({
  selector: 'app-process-form-page',
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
  templateUrl: './process-form.page.html',
  styleUrl: './process-form.page.scss',
})
export class ProcessFormPageComponent {
  readonly id = input<string>();

  private readonly api = inject(BackofficeApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly accessControl = inject(AccessControlUtil);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breadcrumbOwner = Symbol('process-form-page');

  protected readonly areas = signal<AreaRecord[]>([]);
  protected readonly processRecord = signal<ProcessRecord | null>(null);
  protected readonly processCode = signal<string | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly pageTitle = computed(() => (this.id() ? 'Edit process' : 'Create process'));
  protected readonly availableTeams = computed(() => this.accessControl.getAvailableTeams(this.teams()));
  protected readonly canManageProcess = computed(() => this.accessControl.canManageProcess(this.processRecord()));

  protected readonly form = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    areaId: ['', [Validators.required]],
    teamId: ['', [Validators.required]],
    ownerId: [{ value: '', disabled: true }, [Validators.required]],
  });

  private readonly dropdown = createTeamOwnerDropdown(
    this.form.controls.teamId,
    this.form.controls.ownerId,
    (teamId) => this.api.listOwnerOptions(teamId),
  );

  protected readonly owners = this.dropdown.owners;
  protected readonly teams = this.dropdown.teams;
  protected readonly selectedTeamId = this.dropdown.selectedTeamId;
  protected readonly filteredOwners = this.dropdown.filteredOwners;
  protected readonly ownerLoadError = this.dropdown.ownerLoadError;

  constructor() {
    bindFormPageLifecycle(
      this.destroyRef,
      this.breadcrumbs,
      this.breadcrumbOwner,
      () => void this.loadPage(this.id()),
    );
  }

  protected async submit(): Promise<void> {
    if (!this.canManageProcess()) {
      this.errorMessage.set('You can only manage processes owned by your team.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    try {
      const payload = {
        areaId: this.form.controls.areaId.getRawValue(),
        teamId: this.form.controls.teamId.getRawValue(),
        ownerId: this.form.controls.ownerId.getRawValue(),
        title: this.form.controls.title.getRawValue(),
        description: this.form.controls.description.getRawValue() || '',
      };

      if (this.id()) {
        await firstValueFrom(this.api.updateProcess(this.id()!, payload));
        this.toast.success('Process updated successfully');
      } else {
        await firstValueFrom(this.api.createProcess(payload));
        this.toast.success('Process created successfully');
      }

      await this.router.navigateByUrl('/processes');
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to save the process.'));
      this.toast.error('Failed to save process');
    } finally {
      this.isSaving.set(false);
    }
  }

  private async loadPage(processId: string | undefined): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.dropdown.resetLoadState();

    try {
      const [areas, teams, process] = await Promise.all([
        firstValueFrom(this.api.listAreas()),
        firstValueFrom(this.api.listTeamOptions()),
        processId
          ? firstValueFrom(this.api.getProcess(processId))
          : Promise.resolve<ProcessRecord | null>(null),
      ]);

      this.areas.set(areas);
      this.teams.set(teams);
      this.processRecord.set(process);
      this.processCode.set(process?.code ?? null);
      if (process) {
        this.breadcrumbs.setOverride(this.breadcrumbOwner, [
          { label: 'Processes', url: '/processes' },
          { label: process.title },
          { label: 'Edit process' },
        ]);
      }

      if (!this.canManageLoadedProcess(process)) {
        this.form.disable({ emitEvent: false });
        this.errorMessage.set('You can only manage processes owned by your team.');
        return;
      }

      const lockedTeamId = this.accessControl.getLockedTeamId(process);
      await this.dropdown.bindTeamAndLoadOwners(lockedTeamId);

      this.form.reset(
        {
          title: process?.title ?? '',
          description: process?.description ?? '',
          areaId: process?.areaId ?? '',
          teamId: lockedTeamId,
          ownerId: process?.ownerId ?? '',
        },
        { emitEvent: false },
      );
      this.form.controls.teamId.disable({ emitEvent: false });
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load the process form.'));
    } finally {
      this.isLoading.set(false);
    }
  }

  private canManageLoadedProcess(process: ProcessRecord | null): boolean {
    return this.accessControl.canManageProcess(process);
  }
}
