import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
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
import { AreaRecord, ProcessRecord } from '../../core/models/backoffice.models';
import { getHttpErrorMessage } from '../../core/http/http-error-message';

@Component({
  selector: 'app-area-detail-page',
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
  templateUrl: './area-detail.page.html',
  styleUrl: './area-detail.page.scss',
})
export class AreaDetailPageComponent {
  readonly id = input<string>();

  private readonly api = inject(BackofficeApiService);

  protected readonly area = signal<AreaRecord | null>(null);
  protected readonly processes = signal<ProcessRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const areaId = this.id();

      if (!areaId) {
        this.errorMessage.set('Area ID not provided');
        this.isLoading.set(false);
        return;
      }

      void this.loadAreaData(areaId);
    });
  }

  private async loadAreaData(areaId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const [area, processes] = await Promise.all([
        firstValueFrom(this.api.getArea(areaId)),
        firstValueFrom(this.api.listProcesses()),
      ]);

      this.area.set(area);
      this.processes.set(processes.filter((process) => process.areaId === areaId));
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load area information.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}
