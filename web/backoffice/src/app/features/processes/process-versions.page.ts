import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
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
import { AccessControlUtil } from '../../core/governance/access-control.util';
import { BreadcrumbService } from '../../core/navigation/breadcrumb.service';
import { ProcessRecord, ProcessVersionRecord } from '../../core/models/backoffice.models';
import { getHttpErrorMessage } from '../../core/http/http-error-message';

@Component({
  selector: 'app-process-versions-page',
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
  templateUrl: './process-versions.page.html',
  styleUrl: './process-versions.page.scss',
})
export class ProcessVersionsPageComponent {
  readonly id = input<string>();

  private readonly api = inject(BackofficeApiService);
  private readonly accessControl = inject(AccessControlUtil);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breadcrumbOwner = Symbol('process-versions-page');

  protected readonly process = signal<ProcessRecord | null>(null);
  protected readonly versions = signal<ProcessVersionRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly canCreateVersion = computed(() => this.accessControl.canCreateVersion(this.process()));
  protected readonly displayedColumns = ['versionNumber', 'title', 'lifecycleState', 'architectureState', 'changeDescription', 'actions'];

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.breadcrumbs.clearOverride(this.breadcrumbOwner);
    });

    effect(() => {
      const processId = this.id();
      if (processId) {
        void this.loadPage(processId);
      }
    });
  }

  private async loadPage(processId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const [process, versions] = await Promise.all([
        firstValueFrom(this.api.getProcess(processId)),
        firstValueFrom(this.api.listProcessVersions(processId)),
      ]);

      this.process.set(process);
      this.versions.set([...versions].sort((a, b) => b.versionNumber - a.versionNumber));
      this.breadcrumbs.setOverride(this.breadcrumbOwner, [
        { label: 'Processes', url: '/processes' },
        { label: process.title },
        { label: 'Versions' },
      ]);
    } catch (error) {
      this.errorMessage.set(
        getHttpErrorMessage(error, 'Unable to load the version workspace.'),
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
