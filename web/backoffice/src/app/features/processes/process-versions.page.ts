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
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AccessControlUtil } from '../../core/governance/access-control.util';
import { BreadcrumbService } from '../../core/navigation/breadcrumb.service';
import { ProcessRecord, ProcessVersionRecord } from '../../core/models/backoffice.models';
import { getHttpErrorMessage } from '../../core/http/http-error-message';

@Component({
  selector: 'app-process-versions-page',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }

      .page {
        max-width: 72rem;
      }

      .version-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
      }

      .version-table th,
      .version-table td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      .version-table th {
        font-weight: 600;
        color: #5f6368;
      }

      .version-table tr:last-child td {
        border-bottom: none;
      }
    `,
  ],
  template: `
    <section class="page">
      <section class="bo-page-intro page-header">
        <div class="header-row">
          <div class="bo-page-intro__copy">
            <h1>Version workspace</h1>
            <p class="muted">Create draft versions, then continue governance work from the version detail page.</p>
          </div>
          @if (canCreateVersion()) {
            <a mat-flat-button color="primary" [routerLink]="['/processes', id(), 'versions', 'new']">
              <mat-icon>add</mat-icon>
              New version
            </a>
          }
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
      } @else if (process(); as process) {
        <mat-card appearance="outlined">
          <mat-card-header>
            <mat-card-title>{{ process.title }}</mat-card-title>
            <mat-card-subtitle>{{ process.code }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ process.description || 'No description provided.' }}</p>
            <mat-chip-set>
              <mat-chip>Owner: {{ process.ownerName }}</mat-chip>
            </mat-chip-set>
          </mat-card-content>
        </mat-card>

        @if (versions().length === 0) {
          <mat-card appearance="outlined">
            <mat-card-content>No versions exist for this process yet.</mat-card-content>
          </mat-card>
        } @else {
          <mat-card appearance="outlined">
            <mat-card-content>
              <table mat-table [dataSource]="versions()" class="version-table">
                <ng-container matColumnDef="versionNumber">
                  <th mat-header-cell *matHeaderCellDef>Version</th>
                  <td mat-cell *matCellDef="let version">v{{ version.versionNumber }}</td>
                </ng-container>

                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef>Title</th>
                  <td mat-cell *matCellDef="let version">{{ version.title }}</td>
                </ng-container>

                <ng-container matColumnDef="lifecycleState">
                  <th mat-header-cell *matHeaderCellDef>State</th>
                  <td mat-cell *matCellDef="let version">
                    <mat-chip>{{ version.lifecycleState }}</mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="architectureState">
                  <th mat-header-cell *matHeaderCellDef>Architecture</th>
                  <td mat-cell *matCellDef="let version">
                    <mat-chip>{{ version.architectureState }}</mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="changeDescription">
                  <th mat-header-cell *matHeaderCellDef>Change Description</th>
                  <td mat-cell *matCellDef="let version">{{ version.changeDescription }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let version" style="text-align: right;">
                    <a mat-button [routerLink]="['/versions', version.id]">
                      <mat-icon>open_in_new</mat-icon>
                      Open detail
                    </a>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        }
      }
    </section>
  `,
})
export class ProcessVersionsPageComponent {
  readonly id = input<string>();

  private readonly api = inject(BackofficeApiService);
  private readonly accessControl = inject(AccessControlUtil);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breadcrumbOwner = Symbol('process-versions-page');

  protected readonly process = signal<ProcessRecord | null>(null);
  protected readonly versions = signal<ProcessVersionRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly canCreateVersion = computed(() => this.accessControl.canCreateVersion(this.process()));
  protected readonly displayedColumns = ['versionNumber', 'title', 'lifecycleState', 'architectureState', 'changeDescription', 'actions'];

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

  private async loadPage(processId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const [process, versions] = await Promise.all([
        firstValueFrom(this.api.getProcess(processId)),
        firstValueFrom(this.api.listProcessVersions(processId)),
      ]);

      this.process.set(process);
      this.versions.set([...versions].sort((a, b) => b.versionNumber - a.versionNumber));
      this.breadcrumbs.setOverride(this.breadcrumbOwner, [
        { label: 'Processes', url: '/processes' },
        { label: process.title },
        { label: 'Versions' },
      ]);
    } catch (error) {
      this.errorMessage.set(
        getHttpErrorMessage(error, 'Unable to load the version workspace.'),
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
