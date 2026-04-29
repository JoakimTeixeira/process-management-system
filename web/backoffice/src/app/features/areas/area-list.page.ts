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

      .area-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
      }

      .area-table th,
      .area-table td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      .area-table th {
        font-weight: 600;
        color: #5f6368;
      }

      .area-table tr:last-child td {
        border-bottom: none;
      }

      .action-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }
    `,
  ],
  template: `
    <section class="page">
      <section class="bo-page-intro page-header">
        <div class="header-row">
          <div class="bo-page-intro__copy">
            <h1>Areas</h1>
            <p class="muted">Create and maintain the governance areas that own processes.</p>
          </div>
          <a mat-flat-button color="primary" routerLink="/areas/new">
            <mat-icon>add</mat-icon>
            New area
          </a>
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
      } @else if (areas().length === 0) {
        <mat-card appearance="outlined">
          <mat-card-content>No areas have been created yet.</mat-card-content>
        </mat-card>
      } @else {
        @if (actionErrorMessage(); as actionErrorMessage) {
          <mat-card appearance="outlined">
            <mat-card-content>{{ actionErrorMessage }}</mat-card-content>
          </mat-card>
        }

        <mat-card appearance="outlined">
          <mat-card-content>
            <table mat-table [dataSource]="areas()" class="area-table">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let area">{{ area.title }}</td>
              </ng-container>

              <ng-container matColumnDef="code">
                <th mat-header-cell *matHeaderCellDef>Code</th>
                <td mat-cell *matCellDef="let area">{{ area.code }}</td>
              </ng-container>

              <ng-container matColumnDef="itilPractice">
                <th mat-header-cell *matHeaderCellDef>ITIL Practice</th>
                <td mat-cell *matCellDef="let area">
                  <mat-chip>{{ area.itilPractice.name }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="owner">
                <th mat-header-cell *matHeaderCellDef>Owner</th>
                <td mat-cell *matCellDef="let area">
                  <mat-chip>{{ area.ownerName }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="team">
                <th mat-header-cell *matHeaderCellDef>Team</th>
                <td mat-cell *matCellDef="let area">
                  <mat-chip>{{ area.teamName }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef style="text-align: right;">Actions</th>
                <td mat-cell *matCellDef="let area" style="text-align: right;">
                  @if (canEdit()) {
                    <div style="position: relative; display: inline-block;">
                      <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Area actions">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      @if (canDeleteArea(area)) {
                        <div style="position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; background-color: #f44336; border-radius: 50%; border: 1px solid white;"></div>
                      }
                      <mat-menu #menu="matMenu">
                        <a mat-menu-item [routerLink]="['/areas', area.id]">
                          <mat-icon>open_in_new</mat-icon>
                          <span>Open area</span>
                        </a>
                        <a mat-menu-item [routerLink]="['/areas', area.id, 'edit']">
                          <mat-icon>edit</mat-icon>
                          <span>Edit area</span>
                        </a>
                        @if (canDeleteArea(area)) {
                          <mat-divider></mat-divider>
                          <button mat-menu-item (click)="confirmDeleteArea(area)" [disabled]="isDeletingArea()">
                            <mat-icon color="warn">delete</mat-icon>
                            <span>Delete area</span>
                          </button>
                        }
                      </mat-menu>
                    </div>
                  }
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </section>
  `,
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
