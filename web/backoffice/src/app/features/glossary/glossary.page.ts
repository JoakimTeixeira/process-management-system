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
import { GlossaryResponse } from '../../core/models/backoffice.models';
import { getHttpErrorMessage } from '../../core/http/http-error-message';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-glossary-page',
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
  templateUrl: './glossary.page.html',
  styleUrl: './glossary.page.scss',
})
export class GlossaryPageComponent implements OnInit {
  private readonly api = inject(BackofficeApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly glossary = signal<GlossaryResponse | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly canEdit = computed(() => this.auth.currentUser()?.role.name === 'EDITOR');
  protected readonly displayedColumns = ['term', 'category', 'definition', 'isPreferred', 'actions'];

  ngOnInit() {
    void this.loadGlossary();
  }

  private async loadGlossary(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.glossary.set(await firstValueFrom(this.api.getGlossary()));
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load the glossary.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}
