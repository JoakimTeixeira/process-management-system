import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
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
  templateUrl: './user-list.page.html',
  styleUrl: './user-list.page.scss',
})
export class UserListPageComponent implements OnInit {
  private readonly api = inject(BackofficeApiService);
  private readonly auth = inject(AuthService);

  protected readonly users = signal<AdminUser[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly canEdit = computed(() => this.auth.currentUser()?.role.name === 'SYSTEM_ADMIN');
  protected readonly displayedColumns = ['name', 'email', 'role', 'team', 'isActive', 'actions'];

  ngOnInit(): void {
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

  protected formatRoleName(roleName: string): string {
    // Convert role names from underscores to spaces (e.g., "SYSTEM_ADMIN" -> "System Admin")
    return roleName
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
