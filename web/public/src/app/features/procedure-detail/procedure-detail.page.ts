import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);

  protected detail: PublicProcedureDetail | null = null;
  protected loading = true;
  protected errorMessage: string | null = null;
  protected breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', link: '/' }];
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
      this.loading = false;
      this.errorMessage = 'The requested procedure could not be identified.';
      this.cdr.markForCheck();
      return;
    }

    this.publicPortalApi.getProcedureDetail(procedureId).subscribe({
      next: (detail) => {
        this.detail = detail;
        this.breadcrumbs = buildProcedureBreadcrumbs(detail, context);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'The requested public procedure could not be loaded.';
        this.cdr.markForCheck();
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
