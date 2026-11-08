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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
  templateUrl: './process-list.page.html',
  styleUrl: './process-list.page.scss',
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

  protected canPerformReopenAction(process: ProcessRecord): string[] | null {
    const activeVersion = process.governanceSummary?.activeWorkflowVersion;
    if (!activeVersion) {
      return null;
    }
    // Only REVIEWERs can reopen, and only when version is Approved
    if (this.currentUserRole() !== 'REVIEWER') {
      return null;
    }
    if (activeVersion.lifecycleState !== 'Approved') {
      return null;
    }
    // Must be same team
    if (!this.accessControl.canReviewVersion(process)) {
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
