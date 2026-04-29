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
import { TeamRecord } from '../../core/models/backoffice.models';
import { getHttpErrorMessage } from '../../core/http/http-error-message';

@Component({
  selector: 'app-team-list-page',
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
        display: grid;
        gap: 1rem;
      }

      .header-row {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
      }

      .center-state {
        display: grid;
        place-items: center;
        min-height: 12rem;
      }

      .muted {
        color: #5f6368;
      }

      .team-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
      }

      .team-table th,
      .team-table td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
        vertical-align: top;
      }

      .team-table th {
        font-weight: 600;
        color: #5f6368;
      }

      .team-table tr:last-child td {
        border-bottom: none;
      }

      ::ng-deep {
        .team-status {
          &.active {
            background-color: #dcedc8 !important;
          }

          &.inactive {
            background-color: #e0e0e0 !important;
          }

          .mat-mdc-chip-action-label {
            color: #424242 !important;
          }

          .mdc-evolution-chip__action--primary::before {
            border-width: 0 !important;
          }
        }
      }
    `,
  ],
  template: `
    <section class="page">
      <section class="bo-page-intro">
        <div class="header-row">
          <div class="bo-page-intro__copy">
            <h1>Team administration</h1>
            <p class="muted">
              Create, update, and deactivate the reference teams used across user and governance
              forms.
            </p>
          </div>

          <a mat-flat-button color="primary" routerLink="/admin/teams/new">
            <mat-icon>group_add</mat-icon>
            New team
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
      } @else if (teams().length === 0) {
        <mat-card appearance="outlined">
          <mat-card-content>No teams are available yet.</mat-card-content>
        </mat-card>
      } @else {
        <mat-card appearance="outlined">
          <mat-card-content>
            <table mat-table [dataSource]="teams()" class="team-table">
              <ng-container matColumnDef="code">
                <th mat-header-cell *matHeaderCellDef>Code</th>
                <td mat-cell *matCellDef="let team">{{ team.code }}</td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let team">{{ team.name }}</td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let team">{{ team.description }}</td>
              </ng-container>

              <ng-container matColumnDef="isActive">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let team">
                  <mat-chip class="team-status" [class.active]="team.isActive" [class.inactive]="!team.isActive">
                    {{ team.isActive ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef style="text-align: right;">Actions</th>
                <td mat-cell *matCellDef="let team" style="text-align: right;">
                  <a mat-icon-button [routerLink]="['/admin/teams', team.id, 'edit']" aria-label="Edit team">
                    <mat-icon>edit</mat-icon>
                  </a>
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
export class TeamListPageComponent {
  private readonly api = inject(BackofficeApiService);

  protected readonly teams = signal<TeamRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly displayedColumns = ['code', 'name', 'description', 'isActive', 'actions'];

  constructor() {
    void this.loadTeams();
  }

  private async loadTeams(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.teams.set(await firstValueFrom(this.api.listTeams()));
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load the teams.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}
