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
import { AdminUser } from '../../core/models/backoffice.models';
import { getHttpErrorMessage } from '../../core/http/http-error-message';

@Component({
  selector: 'app-user-list-page',
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

      .user-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
      }

      .user-table th,
      .user-table td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      .user-table th {
        font-weight: 600;
        color: #5f6368;
      }

      .user-table tr:last-child td {
        border-bottom: none;
      }

      .user-table.hide-actions th:last-child,
      .user-table.hide-actions td:last-child {
        display: none;
      }

      ::ng-deep {
        .user-status {

          &.active {
            background-color: #dcedc8 !important;
          }

          &.inactive {
            background-color: #ffcdd2 !important;
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
          <h1>User administration</h1>
          <p class="muted">Technical-only administration for roles, teams, activation state, and password reset.</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/admin/users/new">
          <mat-icon>person_add</mat-icon>
          New user
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
      } @else if (users().length === 0) {
        <mat-card appearance="outlined">
          <mat-card-content>No users are available yet.</mat-card-content>
        </mat-card>
      } @else {
        <mat-card appearance="outlined">
          <mat-card-content>
            <table mat-table [dataSource]="users()" [class.hide-actions]="!canEdit()" class="user-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let user">{{ user.name }}</td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let user">{{ user.email }}</td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip>{{ user.role.name }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="team">
                <th mat-header-cell *matHeaderCellDef>Team</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip>{{ user.team.code }} - {{ user.team.name }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="isActive">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip class="user-status" [class.active]="user.isActive" [class.inactive]="!user.isActive">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let user">
                  <a mat-button [routerLink]="['/admin/users', user.id, 'edit']">
                    <mat-icon>edit</mat-icon>
                    Edit
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
export class UserListPageComponent {
  private readonly api = inject(BackofficeApiService);
  private readonly auth = inject(AuthService);

  protected readonly users = signal<AdminUser[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly canEdit = computed(() => this.auth.currentUser()?.role.name === 'SYSTEM_ADMIN');
  protected readonly displayedColumns = ['name', 'email', 'role', 'team', 'isActive', 'actions'];

  constructor() {
    void this.loadUsers();
  }

  private async loadUsers(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.users.set(await firstValueFrom(this.api.listUsers()));
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load users.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}
