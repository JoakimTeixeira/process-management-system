import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
import { AuthService } from '../../core/auth/auth.service';
import { AreaRecord } from '../../core/models/backoffice.models';
import { getHttpErrorMessage } from '../../core/http/http-error-message';

@Component({
  selector: 'app-area-list-page',
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
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let area">
                  @if (canEdit()) {
                    <a mat-button [routerLink]="['/areas', area.id, 'edit']">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </a>
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
export class AreaListPageComponent {
  private readonly api = inject(BackofficeApiService);
  private readonly auth = inject(AuthService);

  protected readonly areas = signal<AreaRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly canEdit = computed(() => this.auth.currentUser()?.role.name === 'EDITOR');
  protected readonly displayedColumns = [
    'title',
    'code',
    'itilPractice',
    'owner',
    'team',
    'actions',
  ];

  constructor() {
    void this.loadAreas();
  }

  private async loadAreas(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.areas.set(await firstValueFrom(this.api.listAreas()));
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load areas.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}
