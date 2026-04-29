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
import { MatDialogModule } from '@angular/material/dialog';
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
import { AreaRecord, ProcedureRecord, ProcessRecord } from '../../core/models/backoffice.models';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-procedure-list-page',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
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

      .procedure-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
      }

      .procedure-table th,
      .procedure-table td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      .procedure-table th {
        font-weight: 600;
        color: #5f6368;
      }

      .procedure-table tr:last-child td {
        border-bottom: none;
      }
    `,
  ],
  template: `
    <section class="page">
      <section class="bo-page-intro page-header">
        <div class="bo-page-intro__copy">
          <h1>Procedures</h1>
          <p class="muted">
            Browse procedure content across process versions and jump to the parent version
            workspace.
          </p>
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
      } @else if (procedures().length === 0) {
        <mat-card appearance="outlined">
          <mat-card-content>No procedures are available yet.</mat-card-content>
        </mat-card>
      } @else {
        <mat-card appearance="outlined">
          <mat-card-content>
            <div class="filter-row">
              <mat-form-field appearance="outline">
                <mat-label>Filter by area</mat-label>
                <mat-select
                  [value]="selectedAreaId()"
                  (selectionChange)="onAreaSelectionChange($event.value)"
                >
                  <mat-option value="">All areas</mat-option>
                  @for (area of areaOptions(); track area.id) {
                    <mat-option [value]="area.id">{{ area.code }} - {{ area.title }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Filter by process</mat-label>
                <mat-select
                  [value]="selectedProcessId()"
                  (selectionChange)="selectedProcessId.set($event.value)"
                >
                  <mat-option value="">All processes</mat-option>
                  @for (process of processOptions(); track process.id) {
                    <mat-option [value]="process.id">{{ process.code }} - {{ process.title }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            @if (filteredProcedures().length === 0) {
              <p class="muted">No procedures match the selected filters.</p>
            } @else {
              <table mat-table [dataSource]="filteredProcedures()" class="procedure-table">
                <ng-container matColumnDef="code">
                  <th mat-header-cell *matHeaderCellDef>Procedure</th>
                  <td mat-cell *matCellDef="let procedure">
                    <div>
                      {{ procedure.code }}. <span class="muted">{{ procedure.title }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="process">
                  <th mat-header-cell *matHeaderCellDef>Process</th>
                  <td mat-cell *matCellDef="let procedure">
                    <div>
                      {{ procedure.processCode }}.
                      <span class="muted">{{ procedure.processTitle }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="version">
                  <th mat-header-cell *matHeaderCellDef>Version</th>
                  <td mat-cell *matCellDef="let procedure">
                    @if (procedure.versionNumber) {
                      <mat-chip>
                        v{{ procedure.versionNumber }} - {{ procedure.architectureState || '-' }}
                      </mat-chip>
                    } @else {
                      <span class="muted">-</span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="lifecycle">
                  <th mat-header-cell *matHeaderCellDef>State</th>
                  <td mat-cell *matCellDef="let procedure">
                    @if (procedure.lifecycleState) {
                      <mat-chip [ngClass]="'state-' + procedure.lifecycleState.toLowerCase().replace(' ', '-')"
                        >{{ procedure.lifecycleState }}</mat-chip
                      >
                    } @else {
                      <span class="muted">-</span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef style="text-align: right;">Actions</th>
                  <td mat-cell *matCellDef="let procedure" style="text-align: right;">
                    <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                      <!-- Always show Open version -->
                      <a
                        mat-icon-button
                        color="primary"
                        [routerLink]="['/versions', procedure.processVersionId]"
                        [queryParams]="{ tab: 'procedures' }"
                        aria-label="Open version"
                      >
                        <mat-icon>open_in_new</mat-icon>
                      </a>

                    </div>
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
export class ProcedureListPageComponent implements OnInit {
  private readonly api = inject(BackofficeApiService);
  private readonly accessControl = inject(AccessControlUtil);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly procedures = signal<ProcedureRecord[]>([]);
  protected readonly processes = signal<ProcessRecord[]>([]);
  protected readonly areas = signal<AreaRecord[]>([]);
  protected readonly selectedAreaId = signal('');
  protected readonly selectedProcessId = signal('');
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly canEdit = computed(() => this.accessControl.hasRole('EDITOR'));
  protected readonly currentUserRole = computed(() => this.accessControl.currentUserRole());
  protected readonly areaOptions = computed(() =>
    [...this.areas()].sort((left, right) => left.title.localeCompare(right.title)),
  );
  protected readonly processOptions = computed(() =>
    [...this.processes()]
      .filter((process) => !this.selectedAreaId() || process.areaId === this.selectedAreaId())
      .sort((left, right) => left.title.localeCompare(right.title)),
  );
  protected readonly filteredProcedures = computed(() => {
    const selectedAreaId = this.selectedAreaId();
    const selectedProcessId = this.selectedProcessId();
    const processAreaById = new Map(
      this.processes().map((process) => [process.id, process.areaId] as const),
    );

    return this.procedures().filter((procedure) => {
      if (selectedProcessId.length > 0 && procedure.processId !== selectedProcessId) {
        return false;
      }

      if (selectedAreaId.length === 0) {
        return true;
      }

      return procedure.processId
        ? processAreaById.get(procedure.processId) === selectedAreaId
        : false;
    });
  });
  protected readonly displayedColumns = ['code', 'process', 'version', 'lifecycle', 'actions'];

  ngOnInit(): void {
    void this.loadProcedures();
  }

  protected onAreaSelectionChange(areaId: string): void {
    this.selectedAreaId.set(areaId);

    if (
      this.selectedProcessId().length > 0 &&
      !this.processOptions().some((process) => process.id === this.selectedProcessId())
    ) {
      this.selectedProcessId.set('');
    }
  }



  private async loadProcedures(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const [procedures, processes, areas] = await Promise.all([
        firstValueFrom(this.api.listAllProcedures()),
        firstValueFrom(this.api.listProcesses()),
        firstValueFrom(this.api.listAreas()),
      ]);
      this.procedures.set(procedures);
      this.processes.set(processes);
      this.areas.set(areas);
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load procedures.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}
