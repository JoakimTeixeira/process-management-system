import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AccessControlUtil } from '../../core/governance/access-control.util';
import { getHttpErrorMessage } from '../../core/http/http-error-message';
import { AreaRecord, ProcessRecord } from '../../core/models/backoffice.models';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDeleteDialogComponent, ConfirmDeleteDialogData } from '../../shared/confirm-delete-dialog.component';

@Component({
  selector: 'app-process-list-page',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }

      .page-header {
        display: grid;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .header-row {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
      }

      .muted {
        color: #5f6368;
      }

      .center-state {
        display: grid;
        place-items: center;
        min-height: 12rem;
      }

      .filter-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }

      .filter-row mat-form-field {
        min-width: 16rem;
        flex: 1 1 16rem;
      }

      .process-table {
        width: 100%;
        border-collapse: collapse;
        background-color: #ffffff;
      }

      .process-table th,
      .process-table td {
        padding: var(--spacing-3) var(--spacing-4);
        text-align: left;
        background-color: #ffffff;
      }

      .process-table th {
        font-weight: 600;
        color: var(--portal-muted);
        font-size: var(--font-size-sm);
        border-bottom: 1px solid var(--portal-border);
      }

      .process-table td {
        border-bottom: 1px solid var(--portal-border);
      }

      .process-table tr:last-child td {
        border-bottom: none;
      }

      .waiting-for-me {
        font-weight: 600;
        color: var(--portal-blue);
      }
    `,
  ],
  template: `
    <section class="page">
      <section class="bo-page-intro page-header">
        <div class="header-row">
          <div class="bo-page-intro__copy">
            <h1>Processes</h1>
            <p class="muted">Browse governed processes and open their version workspaces.</p>
          </div>
          @if (canEdit()) {
            <a mat-flat-button color="primary" routerLink="/processes/new">
              <mat-icon>add</mat-icon>
              New process
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
      } @else if (processes().length === 0) {
        <mat-card appearance="outlined">
          <mat-card-content>No processes are available yet.</mat-card-content>
        </mat-card>
      } @else {
        <mat-card appearance="outlined">
          <mat-card-content>
            <div class="filter-row">
              <mat-form-field appearance="outline">
                <mat-label>Filter by area</mat-label>
                <mat-select
                  [value]="selectedAreaId()"
                  (selectionChange)="selectedAreaId.set($event.value)"
                >
                  <mat-option value="">All areas</mat-option>
                  @for (area of areaOptions(); track area.id) {
                    <mat-option [value]="area.id">{{ area.code }} - {{ area.title }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            @if (filteredProcesses().length === 0) {
              <p class="muted">No processes match the selected area.</p>
            } @else {
              <table mat-table [dataSource]="filteredProcesses()" class="process-table">
                <ng-container matColumnDef="process">
                  <th mat-header-cell *matHeaderCellDef>Process</th>
                  <td mat-cell *matCellDef="let process">
                    <div>
                      {{ process.code }}. <span class="muted">{{ process.title }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="state">
                  <th mat-header-cell *matHeaderCellDef>State</th>
                  <td mat-cell *matCellDef="let process">
                    <mat-chip
                      color="primary"
                      [ngClass]="'state-' + lifecycleState(process).toLowerCase().replace(' ', '-')"
                      >{{ lifecycleState(process) }}</mat-chip
                    >
                  </td>
                </ng-container>

                <ng-container matColumnDef="versions">
                  <th mat-header-cell *matHeaderCellDef>Version</th>
                  <td mat-cell *matCellDef="let process">
                    @if (process.governanceSummary?.activeWorkflowVersion) {
                      <span
                        >v{{ process.governanceSummary.activeWorkflowVersion.versionNumber }}</span
                      >
                    } @else {
                      <span class="muted">-</span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="waitingFor">
                  <th mat-header-cell *matHeaderCellDef>Waiting For</th>
                  <td mat-cell *matCellDef="let process">
                    @if (isWaitingForCurrentUser(process)) {
                      <span class="waiting-for-me">Waiting for you</span>
                    } @else {
                      <span class="muted">{{ waitingForRole(process) }}</span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="team">
                  <th mat-header-cell *matHeaderCellDef>Team</th>
                  <td mat-cell *matCellDef="let process">
                    <mat-chip>{{ process.teamName }}</mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="owner">
                  <th mat-header-cell *matHeaderCellDef>Owner</th>
                  <td mat-cell *matCellDef="let process">
                    <mat-chip>{{ process.ownerName }}</mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="nextAction">
                  <th mat-header-cell *matHeaderCellDef>Next Action</th>
                  <td mat-cell *matCellDef="let process">{{ nextAction(process) }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef style="text-align: right;">Actions</th>
                  <td mat-cell *matCellDef="let process" style="text-align: right;">
                    <div style="position: relative; display: inline-block;">
                      <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Process actions">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      @if (canDeleteProcess(process)) {
                        <div style="position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; background-color: #f44336; border-radius: 50%; border: 1px solid white;"></div>
                      }
                    </div>
                    <mat-menu #menu>
                      @if (canPerformWorkAction(process); as workRoute) {
                        <a mat-menu-item [routerLink]="workRoute" [queryParams]="{ tab: 'work' }" style="font-weight: 600;">
                          <mat-icon>account_tree</mat-icon>
                          <span>{{ workActionLabel(process) }}</span>
                        </a>
                        <mat-divider></mat-divider>
                      }
                      <a
                        mat-menu-item
                        [routerLink]="openRoute(process)"
                        [queryParams]="openQueryParams(process)"
                      >
                        <mat-icon>open_in_new</mat-icon>
                        <span>Open version</span>
                      </a>
                      <a mat-menu-item [routerLink]="['/processes', process.id, 'versions']">
                        <mat-icon>list</mat-icon>
                        <span>Versions</span>
                      </a>
                      @if (canManageProcess(process)) {
                        <a mat-menu-item [routerLink]="['/processes', process.id, 'edit']">
                          <mat-icon>edit</mat-icon>
                          <span>Edit process</span>
                        </a>
                      }
                      @if (canDeleteProcess(process)) {
                        <mat-divider></mat-divider>
                        <button mat-menu-item (click)="deleteProcess(process)" color="warn">
                          <mat-icon>delete</mat-icon>
                          <span>Delete process</span>
                        </button>
                      }
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            }
          </mat-card-content>
        </mat-card>
      }
    </section>
  `,
})
export class ProcessListPageComponent implements OnInit {
  private readonly api = inject(BackofficeApiService);
  private readonly accessControl = inject(AccessControlUtil);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly processes = signal<ProcessRecord[]>([]);
  protected readonly areas = signal<AreaRecord[]>([]);
  protected readonly selectedAreaId = signal('');
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly canEdit = computed(() => this.accessControl.hasRole('EDITOR'));
  protected readonly currentUserRole = computed(() => this.accessControl.currentUserRole());
  protected readonly areaOptions = computed(() =>
    [...this.areas()].sort((left, right) => left.title.localeCompare(right.title)),
  );
  protected readonly filteredProcesses = computed(() => {
    const selectedAreaId = this.selectedAreaId();

    return this.processes().filter(
      (process) => selectedAreaId.length === 0 || process.areaId === selectedAreaId,
    );
  });
  protected readonly displayedColumns = [
    'process',
    'state',
    'versions',
    'waitingFor',
    'nextAction',
    'actions',
  ];

  ngOnInit(): void {
    void this.loadProcesses();
  }

  protected lifecycleState(process: ProcessRecord): string {
    const governanceSummary = process.governanceSummary;

    if (governanceSummary?.activeWorkflowVersion) {
      return governanceSummary.activeWorkflowVersion.lifecycleState;
    }

    if (governanceSummary?.currentAsIsVersion || governanceSummary?.currentToBeVersion) {
      return 'Published';
    }

    if (
      governanceSummary &&
      governanceSummary.versionCounts.total > 0 &&
      governanceSummary.versionCounts.total === governanceSummary.versionCounts.archived
    ) {
      return 'Archived';
    }

    return 'Draft';
  }

  protected waitingForRole(process: ProcessRecord): string {
    if (process.governanceSummary?.activeWorkflowVersion?.waitingForRole) {
      return process.governanceSummary.activeWorkflowVersion.waitingForRole;
    }

    return this.hasNoVersions(process) ? 'EDITOR' : '-';
  }

  protected isWaitingForCurrentUser(process: ProcessRecord): boolean {
    const waitingFor = process.governanceSummary?.activeWorkflowVersion?.waitingForRole;
    return waitingFor === this.currentUserRole();
  }

  protected waitingForLabel(process: ProcessRecord): string {
    if (this.isWaitingForCurrentUser(process)) {
      return 'Waiting for you';
    }
    return this.waitingForRole(process);
  }

  protected nextAction(process: ProcessRecord): string {
    if (process.governanceSummary?.activeWorkflowVersion?.nextAction) {
      return process.governanceSummary.activeWorkflowVersion.nextAction;
    }

    return this.hasNoVersions(process) ? 'Create first version' : '-';
  }

  protected openRoute(process: ProcessRecord): string[] {
    const activeVersion = process.governanceSummary?.activeWorkflowVersion;

    if (activeVersion) {
      return ['/versions', activeVersion.id];
    }

    return ['/processes', process.id, 'versions'];
  }

  protected openQueryParams(
    process: ProcessRecord,
  ): Record<string, string> | null {
    return process.governanceSummary?.activeWorkflowVersion
      ? { tab: 'summary' }
      : null;
  }

  protected workRoute(process: ProcessRecord): string[] | null {
    const activeVersion = process.governanceSummary?.activeWorkflowVersion;

    if (!activeVersion) {
      return null;
    }

    return ['/versions', activeVersion.id];
  }

  protected workActionLabel(process: ProcessRecord): string {
    const activeVersion = process.governanceSummary?.activeWorkflowVersion;

    if (!activeVersion) {
      return 'Open lifecycle work';
    }

    switch (activeVersion.waitingForRole) {
      case 'EDITOR':
        return 'Edit and submit';
      case 'REVIEWER':
        return 'Review version';
      case 'PUBLISHER':
        if (activeVersion.lifecycleState === 'Approved') {
          return 'Publish version';
        }
        if (activeVersion.lifecycleState === 'Published') {
          return 'Archive or promote';
        }
        return 'Manage release';
      default:
        return 'Open lifecycle work';
    }
  }

  protected canManageProcess(process: ProcessRecord): boolean {
    return this.accessControl.canManageProcess(process);
  }

  protected canPerformWorkAction(process: ProcessRecord): string[] | null {
    const activeVersion = process.governanceSummary?.activeWorkflowVersion;
    if (!activeVersion) {
      return null;
    }
    const waitingFor = activeVersion.waitingForRole;
    if (waitingFor !== this.currentUserRole()) {
      return null;
    }
    return ['/versions', activeVersion.id];
  }

  private hasNoVersions(process: ProcessRecord): boolean {
    return (process.governanceSummary?.versionCounts.total ?? 0) === 0;
  }

  protected canDeleteProcess(process: ProcessRecord): boolean {
    // Only allow deletion if user can manage the process and it has no versions
    return this.canManageProcess(process) && this.hasNoVersions(process);
  }

  protected async deleteProcess(process: ProcessRecord): Promise<void> {
    const dialogData: ConfirmDeleteDialogData = {
      title: 'Delete Process',
      message: `Are you sure you want to delete the process "${process.code} - ${process.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete Process',
    };

    const confirmed = await firstValueFrom(
      this.dialog.open(ConfirmDeleteDialogComponent, { data: dialogData }).afterClosed()
    );

    if (confirmed) {
      try {
        await firstValueFrom(this.api.deleteProcess(process.id));
        // Refresh the process list
        await this.loadProcesses();
        // Show success toast
        this.snackBar.open(`Process "${process.code}" deleted successfully`, 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['toast-success'],
        });
      } catch (error) {
        const errorMessage = getHttpErrorMessage(error, 'Unable to delete process.');
        this.errorMessage.set(errorMessage);
        // Show error toast
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['toast-error'],
        });
      }
    }
  }

  private async loadProcesses(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const [processes, areas] = await Promise.all([
        firstValueFrom(this.api.listProcesses()),
        firstValueFrom(this.api.listAreas()),
      ]);
      this.processes.set(processes);
      this.areas.set(areas);
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load processes.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}
