import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
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
  templateUrl: './team-list.page.html',
  styleUrl: './team-list.page.scss',
})
export class TeamListPageComponent implements OnInit {
  private readonly api = inject(BackofficeApiService);

  protected readonly teams = signal<TeamRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly displayedColumns = ['code', 'name', 'description', 'isActive', 'actions'];

  ngOnInit(): void {
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
