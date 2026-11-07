import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';

import { PublicPortalApiService } from '../../core/api/public-portal-api.service';
import { PublicProcedureDetail } from '../../core/models/public-portal.models';
import {
  getArchitectureLabel,
  getArchitectureSubtitle,
} from '../../core/ui/architecture-view.helpers';
import {
  BreadcrumbItem,
  buildProcedureBreadcrumbs,
  ProcedureBreadcrumbContext,
} from '../../shared/breadcrumbs/breadcrumbs.builder';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-procedure-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule, BreadcrumbsComponent],
  templateUrl: './procedure-detail.page.html',
  styleUrl: './procedure-detail.page.scss',
})
export class ProcedureDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly publicPortalApi = inject(PublicPortalApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly detail = signal<PublicProcedureDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly breadcrumbs = signal<BreadcrumbItem[]>([{ label: 'Home', link: '/' }]);
  protected readonly getArchitectureLabel = getArchitectureLabel;
  protected readonly getArchitectureSubtitle = getArchitectureSubtitle;

  protected readActivityField(
    activity: Record<string, unknown>,
    field: 'resource' | 'serviceAction' | 'workInstruction',
  ): string {
    const aliases: Record<typeof field, string[]> = {
      resource: ['resource'],
      serviceAction: ['serviceAction', 'service_action'],
      workInstruction: ['workInstruction', 'work_instruction'],
    };

    const value = aliases[field]
      .map((key) => activity[key])
      .find((candidate) => typeof candidate === 'string' && candidate.trim() !== '');

    return typeof value === 'string' && value.trim() !== '' ? value : 'Not specified.';
  }

  ngOnInit(): void {
    const procedureId = this.route.snapshot.paramMap.get('id');
    const context = this.readProcedureBreadcrumbContext();

    if (!procedureId) {
      this.loading.set(false);
      this.errorMessage.set('The requested procedure could not be identified.');
      return;
    }

    this.publicPortalApi
      .getProcedureDetail(procedureId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.detail.set(detail);
          this.breadcrumbs.set(buildProcedureBreadcrumbs(detail, context));
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('The requested public procedure could not be loaded.');
        },
      });
  }

  private readProcedureBreadcrumbContext(): ProcedureBreadcrumbContext {
    const queryParams = this.route.snapshot.queryParamMap;
    const origin = queryParams.get('origin');
    const originProcessId = queryParams.get('originProcessId')?.trim() ?? '';
    const view = queryParams.get('view');

    if (origin !== 'process' || originProcessId === '') {
      return { origin: 'direct' };
    }

    return {
      origin: 'process',
      originProcessId,
      view: view === 'to-be' || view === 'as-is' ? view : undefined,
    };
  }
}
