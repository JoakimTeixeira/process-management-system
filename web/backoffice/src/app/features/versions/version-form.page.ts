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
import { getHttpErrorMessage } from '../../core/http/http-error-message';
import { BreadcrumbService } from '../../core/navigation/breadcrumb.service';
import { ToastService } from '../../core/toast/toast.service';
import { ProcessRecord, ProcessVersionRecord } from '../../core/models/backoffice.models';

@Component({
  selector: 'app-version-form-page',
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

      .card-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
      }

      .muted {
        color: #5f6368;
      }

      .error-message {
        color: #d93025;
        margin-top: 0.5rem;
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
      } @else if (errorMessage(); as errorMessage) {
        <mat-card appearance="outlined">
          <mat-card-content>{{ errorMessage }}</mat-card-content>
        </mat-card>
      } @else {
        <mat-card appearance="outlined">
          <mat-card-content>
            <form [formGroup]="form">
              <mat-form-field appearance="outline">
                <mat-label>Architecture state</mat-label>
                <mat-select formControlName="architectureState">
                  <mat-option value="AS-IS">AS-IS</mat-option>
                  <mat-option value="TO-BE">TO-BE</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Title</mat-label>
                <input matInput formControlName="title" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Derived from version</mat-label>
                <mat-select formControlName="derivedFromVersionId">
                  <mat-option value="">None</mat-option>
                  @for (version of existingVersions(); track version.id) {
                    <mat-option [value]="version.id">
                      v{{ version.versionNumber }} - {{ version.title }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Change description</mat-label>
                <textarea matInput rows="4" formControlName="changeDescription"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Reason for change</mat-label>
                <textarea matInput rows="4" formControlName="reasonForChange"></textarea>
              </mat-form-field>

              @if (errorMessage(); as errorMessage) {
                <p class="error-message">{{ errorMessage }}</p>
              }

              <div class="card-actions">
                <span class="muted">Process owner is captured on the process record.</span>
                <button mat-flat-button color="primary" type="button" (click)="submit()" [disabled]="isSaving()">
                  <mat-icon>save</mat-icon>
                  Save
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </section>
  `,
})
export class VersionFormPageComponent {
  readonly id = input<string>();

  private readonly api = inject(BackofficeApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly accessControl = inject(AccessControlUtil);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breadcrumbOwner = Symbol('version-form-page');

  protected readonly process = signal<ProcessRecord | null>(null);
  protected readonly existingVersions = signal<ProcessVersionRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly pageTitle = computed(() => 'Create version');
  protected readonly canCreateVersion = computed(() => this.accessControl.canCreateVersion(this.process()));

  protected readonly form = this.fb.group({
    architectureState: ['AS-IS' as 'AS-IS' | 'TO-BE', [Validators.required]],
    title: ['', [Validators.required]],
    derivedFromVersionId: [''],
    changeDescription: ['', [Validators.required]],
    reasonForChange: ['', [Validators.required]],
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.breadcrumbs.clearOverride(this.breadcrumbOwner);
    });

    effect(() => {
      const processId = this.id();
      if (processId) {
        void this.loadPage(processId);
      }
    });
  }

  protected async submit(): Promise<void> {
    if (!this.canCreateVersion()) {
      this.errorMessage.set('You can only create versions for processes owned by your team.');
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
        architectureState: this.form.controls.architectureState.getRawValue(),
        title: this.form.controls.title.getRawValue(),
        changeDescription: this.form.controls.changeDescription.getRawValue(),
        reasonForChange: this.form.controls.reasonForChange.getRawValue(),
        derivedFromVersionId: this.form.controls.derivedFromVersionId.getRawValue() || undefined,
      };

      const createdVersion = await firstValueFrom(
        this.api.createProcessVersion(this.id()!, payload),
      );

      this.toast.success('Version created successfully');
      await this.router.navigate(['/versions', createdVersion.id]);
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to save the version.'));
      this.toast.error('Failed to save version');
    } finally {
      this.isSaving.set(false);
    }
  }

  private async loadPage(processId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const [process, versions] = await Promise.all([
        firstValueFrom(this.api.getProcess(processId)),
        firstValueFrom(this.api.listProcessVersions(processId)),
      ]);
      this.process.set(process);
      this.existingVersions.set(versions);
      this.breadcrumbs.setOverride(this.breadcrumbOwner, [
        { label: 'Processes', url: '/processes' },
        { label: process.title },
        { label: 'Versions', url: `/processes/${process.id}/versions` },
        { label: 'Create version' },
      ]);

      if (!this.canCreateVersion()) {
        this.errorMessage.set('You can only create versions for processes owned by your team.');
      }

      this.form.patchValue({ derivedFromVersionId: '' });
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load the version data.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}
