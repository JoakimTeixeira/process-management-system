import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
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
import { createTeamOwnerDropdown } from '../../core/ui/team-owner-dropdown.util';

@Component({
  selector: 'app-process-form-page',
  imports: [
    CommonModule,
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
  styles: [
    `
      :host {
        display: block;
      }

      .page {
        max-width: 48rem;
      }

      .form-card {
        overflow: hidden;
      }

      .muted-field {
        opacity: 0.5;
      }

      .field-error-message {
        margin: -2rem 0 1rem;
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
        <mat-card class="form-card" appearance="outlined">
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="submit()">
              @if (processCode(); as processCode) {
                <mat-form-field class="bo-code-field" appearance="outline">
                  <mat-label>Generated code</mat-label>
                  <input matInput [value]="processCode" readonly />
                </mat-form-field>
              }

              <mat-form-field appearance="outline">
                <mat-label>Title</mat-label>
                <input matInput formControlName="title" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <textarea matInput rows="4" formControlName="description"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Area</mat-label>
                <mat-select formControlName="areaId">
                  @for (area of areas(); track area.id) {
                    <mat-option [value]="area.id">{{ area.title }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Team</mat-label>
                <mat-select formControlName="teamId">
                  @for (team of availableTeams(); track team.id) {
                    <mat-option [value]="team.id">{{ team.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" [class.muted-field]="!selectedTeamId()">
                <mat-label>Owner</mat-label>
                <mat-select formControlName="ownerId">
                  @for (owner of filteredOwners(); track owner.id) {
                    <mat-option [value]="owner.id">{{ owner.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              @if (ownerLoadError(); as ownerLoadError) {
                <p class="error-message field-error-message">{{ ownerLoadError }}</p>
              }

              @if (errorMessage(); as errorMessage) {
                <p class="error-message">{{ errorMessage }}</p>
              }

              <div class="bo-form-actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="isSaving()">
                  <mat-icon>save</mat-icon>
                  Save process
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </section>
  `,
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
  protected readonly ownerLoadError = signal<string | null>(null);
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
  );

  protected readonly owners = this.dropdown.owners;
  protected readonly teams = this.dropdown.teams;
  protected readonly selectedTeamId = this.dropdown.selectedTeamId;
  protected readonly filteredOwners = this.dropdown.filteredOwners;
  private cleanupDropdown: (() => void) | null = null;
  private ownerOptionsRequestId = 0;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.breadcrumbs.clearOverride(this.breadcrumbOwner);
    });

    effect(() => {
      void this.loadPage(this.id());
    });

    // Clear owner if not in filtered list
    effect(() => {
      const selectedTeamId = this.form.controls.teamId.value;
      const selectedOwnerId = this.form.controls.ownerId.value;
      const availableOwners = this.filteredOwners();

      if (selectedTeamId && selectedOwnerId) {
        const ownerExists = availableOwners.some((owner) => owner.id === selectedOwnerId);
        if (!ownerExists) {
          this.form.controls.ownerId.setValue('');
        }
      }
    });
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
    this.ownerLoadError.set(null);
    this.ownerOptionsRequestId += 1;
    this.owners.set([]);

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

      // Initialize dropdown logic
      if (this.cleanupDropdown) {
        this.cleanupDropdown();
      }
      const lockedTeamId = this.accessControl.getLockedTeamId(process);
      this.cleanupDropdown = this.dropdown.initialize(
        lockedTeamId,
        (teamId) => this.loadOwnersForTeam(teamId),
      );

      if (lockedTeamId) {
        await this.loadOwnersForTeam(lockedTeamId);
      }

      this.form.reset({
        title: process?.title ?? '',
        description: process?.description ?? '',
        areaId: process?.areaId ?? '',
        teamId: lockedTeamId,
        ownerId: process?.ownerId ?? '',
      }, { emitEvent: false });
      this.form.controls.teamId.disable({ emitEvent: false });
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load the process form.'));
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadOwnersForTeam(teamId: string): Promise<void> {
    const requestId = ++this.ownerOptionsRequestId;
    this.ownerLoadError.set(null);
    this.owners.set([]);

    if (!teamId) {
      return;
    }

    try {
      const owners = await firstValueFrom(this.api.listOwnerOptions(teamId));

      if (
        requestId !== this.ownerOptionsRequestId ||
        this.selectedTeamId() !== teamId
      ) {
        return;
      }

      this.owners.set(owners);
    } catch {
      if (
        requestId !== this.ownerOptionsRequestId ||
        this.selectedTeamId() !== teamId
      ) {
        return;
      }

      this.ownerLoadError.set('Unable to load owners for the selected team.');
    }
  }

  private canManageLoadedProcess(process: ProcessRecord | null): boolean {
    return this.accessControl.canManageProcess(process);
  }
}
