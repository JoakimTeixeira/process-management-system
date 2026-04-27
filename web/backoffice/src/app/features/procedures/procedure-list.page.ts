import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
import { getHttpErrorMessage } from '../../core/http/http-error-message';
import { ProcedureRecord } from '../../core/models/backoffice.models';

@Component({
  selector: 'app-procedure-list-page',
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
          <p class="muted">Browse procedure content across process versions and jump to the parent version workspace.</p>
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
            <table mat-table [dataSource]="procedures()" class="procedure-table">
              <ng-container matColumnDef="code">
                <th mat-header-cell *matHeaderCellDef>Procedure</th>
                <td mat-cell *matCellDef="let procedure">
                  <div>{{ procedure.code }}</div>
                  <div class="muted">{{ procedure.title }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="process">
                <th mat-header-cell *matHeaderCellDef>Process</th>
                <td mat-cell *matCellDef="let procedure">
                  <div>{{ procedure.processCode || '-' }}</div>
                  <div class="muted">{{ procedure.processTitle || '-' }}</div>
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
                    <mat-chip>{{ procedure.lifecycleState }}</mat-chip>
                  } @else {
                    <span class="muted">-</span>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let procedure" style="text-align: right;">
                  <a
                    mat-button
                    color="primary"
                    [routerLink]="['/versions', procedure.processVersionId]"
                    [queryParams]="{ tab: 'procedures' }"
                  >
                    <mat-icon>open_in_new</mat-icon>
                    Open version
                  </a>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </section>
  `,
})
export class ProcedureListPageComponent {
  private readonly api = inject(BackofficeApiService);

  protected readonly procedures = signal<ProcedureRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly displayedColumns = ['code', 'process', 'version', 'lifecycle', 'actions'];

  constructor() {
    void this.loadProcedures();
  }

  private async loadProcedures(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.procedures.set(await firstValueFrom(this.api.listAllProcedures()));
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load procedures.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}
