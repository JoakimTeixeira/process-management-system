import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { AreaRecord, ProcessRecord } from '../../core/models/backoffice.models';
import { getHttpErrorMessage } from '../../core/http/http-error-message';
import { ToastService } from '../../core/toast/toast.service';
import { ConfirmDeleteDialogComponent, ConfirmDeleteDialogData } from '../../shared/confirm-delete-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-area-list-page',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatDialogModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './area-list.page.html',
  styleUrl: './area-list.page.scss',
})
export class AreaListPageComponent implements OnInit {
  private readonly api = inject(BackofficeApiService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly areas = signal<AreaRecord[]>([]);
  protected readonly processes = signal<ProcessRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly actionErrorMessage = signal<string | null>(null);
  protected readonly isDeletingArea = signal(false);
  protected readonly canEdit = computed(() => this.auth.currentUser()?.role.name === 'EDITOR');
  protected readonly displayedColumns = [
    'title',
    'code',
    'itilPractice',
    'owner',
    'team',
    'actions',
  ];

  ngOnInit(): void {
    void this.loadAreas();
  }

  private async loadAreas(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.actionErrorMessage.set(null);

    try {
      const [areas, processes] = await Promise.all([
        firstValueFrom(this.api.listAreas()),
        firstValueFrom(this.api.listProcesses()),
      ]);
      this.areas.set(areas);
      this.processes.set(processes);
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load areas.'));
    } finally {
      this.isLoading.set(false);
    }
  }

  protected canDeleteArea(area: AreaRecord): boolean {
    // Only allow deletion if user is EDITOR and area has no processes
    if (!this.canEdit()) {
      return false;
    }

    // Check if any processes belong to this area
    const hasProcesses = this.processes().some(process => process.areaId === area.id);
    return !hasProcesses;
  }

  protected async confirmDeleteArea(area: AreaRecord): Promise<void> {
    const dialogData: ConfirmDeleteDialogData = {
      title: 'Delete Area',
      message: `Are you sure you want to delete the area "${area.code} - ${area.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete Area',
    };

    const confirmed = await firstValueFrom(
      this.dialog.open(ConfirmDeleteDialogComponent, { data: dialogData }).afterClosed()
    );

    if (confirmed) {
      await this.deleteArea(area.id, area.title);
    }
  }

  private async deleteArea(id: string, areaTitle: string): Promise<void> {
    this.isDeletingArea.set(true);
    this.actionErrorMessage.set(null);

    try {
      await firstValueFrom(this.api.deleteArea(id));
      // Refresh the area list
      await this.loadAreas();
      // Show success toast
      this.snackBar.open(`Area "${areaTitle}" deleted successfully`, 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['toast-success'],
      });
    } catch (error) {
      const errorMessage = getHttpErrorMessage(error, 'Unable to delete area.');
      this.actionErrorMessage.set(errorMessage);
      // Show error toast
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['toast-error'],
      });
    } finally {
      this.isDeletingArea.set(false);
    }
  }
}
