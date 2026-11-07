import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';

import { PublicPortalApiService } from '../../core/api/public-portal-api.service';
import {
  PublicProcessDetail,
  PublicProcessHistoryItem,
} from '../../core/models/public-portal.models';
import { ProcessTabId, getProcessTabRoute } from '../../core/routing/process-route.helper';
import {
  getArchitectureLabel,
  getArchitectureSubtitle,
} from '../../core/ui/architecture-view.helpers';
import {
  BreadcrumbItem,
  buildProcessBreadcrumbs,
} from '../../shared/breadcrumbs/breadcrumbs.builder';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs/breadcrumbs.component';
import { ProcessDetailCompareCardComponent } from './process-detail-compare-card.component';
import { ProcessDetailDiagramComponent } from './process-detail-diagram.component';
import { ProcessDetailOverviewComponent } from './process-detail-overview.component';
import {
  buildProcessDetailQueryParams,
  buildProcessDetailTabDefinitions,
  buildProcessVersionOptions,
  countPublishedProcessProcedures,
  formatProcessHistoryDate,
  getCompareSubtitle,
  getCompareTitle,
  getCurrentDetailTabId,
  getProcessTabLabel,
  getProcessVersionForView,
  getPublishedProcessViewsSummary,
  getViewLabel,
  normalizeDetailViewSelection,
  readProcessDetailTabId,
  resolveAvailableProcessViews,
  showsProcessViewSelector,
  type DetailTabDefinition,
  type ViewSelection,
} from './process-detail.page.helpers';
import { ProcessDetailProceduresComponent } from './process-detail-procedures.component';

@Component({
  selector: 'app-process-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    BreadcrumbsComponent,
    ProcessDetailCompareCardComponent,
    ProcessDetailDiagramComponent,
    ProcessDetailOverviewComponent,
    ProcessDetailProceduresComponent,
  ],
  templateUrl: './process-detail.page.html',
  styleUrl: './process-detail.page.scss',
})
export class ProcessDetailPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly publicPortalApi = inject(PublicPortalApiService);
  private loadedProcessId: string | null = null;

  protected readonly detail = signal<PublicProcessDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly historyLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly activeTabId = signal<ProcessTabId>('default');
  protected readonly breadcrumbs = signal<BreadcrumbItem[]>([]);
  protected readonly historyItems = signal<PublicProcessHistoryItem[]>([]);
  protected readonly selectedViewId = signal<ViewSelection>('as-is');
  protected readonly compareLeftViewId = signal<ViewSelection>('as-is');
  protected readonly compareRightViewId = signal<ViewSelection>('to-be');
  protected readonly getArchitectureLabel = getArchitectureLabel;
  protected readonly getArchitectureSubtitle = getArchitectureSubtitle;

  protected readonly currentTabId = computed(() => getCurrentDetailTabId(this.activeTabId()));
  protected readonly versionOptions = computed(() => buildProcessVersionOptions(this.detail()));
  protected readonly selectedViewVersion = computed(() =>
    getProcessVersionForView(this.detail(), this.selectedViewId()),
  );
  protected readonly compareLeftVersion = computed(() =>
    getProcessVersionForView(this.detail(), this.compareLeftViewId()),
  );
  protected readonly compareRightVersion = computed(() =>
    getProcessVersionForView(this.detail(), this.compareRightViewId()),
  );
  protected readonly tabDefinitions = computed<DetailTabDefinition[]>(() =>
    buildProcessDetailTabDefinitions(
      this.selectedViewVersion(),
      this.historyItems().length,
      this.versionOptions().length,
    ),
  );
  protected readonly showsViewSelector = computed(() =>
    showsProcessViewSelector(this.currentTabId()),
  );
  protected readonly compareLeftLabel = computed(() => getViewLabel(this.compareLeftViewId()));
  protected readonly compareRightLabel = computed(() => getViewLabel(this.compareRightViewId()));
  protected readonly compareLeftTitle = computed(() =>
    getCompareTitle(this.compareLeftVersion(), this.compareLeftLabel()),
  );
  protected readonly compareRightTitle = computed(() =>
    getCompareTitle(this.compareRightVersion(), this.compareRightLabel()),
  );
  protected readonly compareLeftSubtitle = computed(() =>
    getCompareSubtitle(this.compareLeftVersion(), this.compareLeftLabel()),
  );
  protected readonly compareRightSubtitle = computed(() =>
    getCompareSubtitle(this.compareRightVersion(), this.compareRightLabel()),
  );
  protected readonly canCompareViews = computed(() => this.versionOptions().length > 1);

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.data, this.route.queryParamMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([paramMap, data, queryParams]) => {
        this.activeTabId.set(readProcessDetailTabId(data, queryParams));
        this.selectedViewId.set(normalizeDetailViewSelection(queryParams.get('view')));
        this.compareLeftViewId.set(normalizeDetailViewSelection(queryParams.get('left')));
        this.compareRightViewId.set(
          normalizeDetailViewSelection(queryParams.get('right'), 'to-be'),
        );

        const processId = paramMap.get('processId');

        if (!processId) {
          this.errorMessage.set('The requested process could not be identified.');
          this.loading.set(false);
          return;
        }

        if (this.loadedProcessId !== processId || !this.detail()) {
          this.loadProcess(processId);
          return;
        }

        this.syncVersionSelections();
        this.updateBreadcrumbs();
      });
  }

  protected handleTabChange(nextTab: Exclude<ProcessTabId, 'default'>): void {
    const detail = this.detail();
    if (!detail) {
      return;
    }

    this.activeTabId.set(nextTab);
    void this.router.navigate([getProcessTabRoute(detail.process.id, nextTab)], {
      queryParams: buildProcessDetailQueryParams(
        nextTab,
        this.selectedViewId(),
        this.compareLeftViewId(),
        this.compareRightViewId(),
      ),
      replaceUrl: true,
    });
  }

  protected handleViewSelection(viewId: 'as-is' | 'to-be'): void {
    const detail = this.detail();
    if (!detail) {
      return;
    }

    this.selectedViewId.set(viewId);
    void this.router.navigate([getProcessTabRoute(detail.process.id, this.currentTabId())], {
      queryParams: buildProcessDetailQueryParams(
        this.currentTabId(),
        this.selectedViewId(),
        this.compareLeftViewId(),
        this.compareRightViewId(),
      ),
      replaceUrl: true,
    });
  }

  protected handleCompareSelection(side: 'left' | 'right', viewId: 'as-is' | 'to-be'): void {
    const detail = this.detail();
    if (!detail) {
      return;
    }

    if (side === 'left') {
      this.compareLeftViewId.set(viewId);
      if (this.compareRightViewId() === viewId) {
        this.compareRightViewId.set(viewId === 'as-is' ? 'to-be' : 'as-is');
      }
    } else {
      this.compareRightViewId.set(viewId);
      if (this.compareLeftViewId() === viewId) {
        this.compareLeftViewId.set(viewId === 'as-is' ? 'to-be' : 'as-is');
      }
    }

    void this.router.navigate([getProcessTabRoute(detail.process.id, 'compare')], {
      queryParams: buildProcessDetailQueryParams(
        'compare',
        this.selectedViewId(),
        this.compareLeftViewId(),
        this.compareRightViewId(),
      ),
      replaceUrl: true,
    });
  }

  protected countPublishedProcedures(): number {
    return countPublishedProcessProcedures(this.detail());
  }

  protected getPublishedViewsSummary(): string {
    return getPublishedProcessViewsSummary(this.detail());
  }

  protected formatHistoryDate(value?: string): string {
    return formatProcessHistoryDate(value);
  }

  protected isDiagramTab(): boolean {
    return this.currentTabId() === 'diagram';
  }

  protected isProceduresTab(): boolean {
    return this.currentTabId() === 'procedures';
  }

  protected isHistoryTab(): boolean {
    return this.currentTabId() === 'history';
  }

  protected isCompareTab(): boolean {
    return this.currentTabId() === 'compare';
  }

  private loadProcess(processId: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.publicPortalApi
      .getProcessDetail(processId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.detail.set(detail);
          this.loadedProcessId = processId;
          this.syncVersionSelections();
          this.loading.set(false);
          this.updateBreadcrumbs();
          this.loadHistory(processId);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('The requested public process could not be loaded.');
        },
      });
  }

  private loadHistory(processId: string): void {
    this.historyLoading.set(true);

    this.publicPortalApi
      .getProcessVersions(processId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (historyItems) => {
          this.historyItems.set(historyItems);
          this.historyLoading.set(false);
          this.updateBreadcrumbs();
        },
        error: () => {
          this.historyLoading.set(false);
          this.historyItems.set([]);
        },
      });
  }

  private syncVersionSelections(): void {
    const resolvedViews = resolveAvailableProcessViews(
      this.detail(),
      this.selectedViewId(),
      this.compareLeftViewId(),
      this.compareRightViewId(),
    );

    this.selectedViewId.set(resolvedViews.selectedViewId);
    this.compareLeftViewId.set(resolvedViews.compareLeftViewId);
    this.compareRightViewId.set(resolvedViews.compareRightViewId);
  }

  private updateBreadcrumbs(): void {
    const detail = this.detail();
    this.breadcrumbs.set(
      detail
        ? buildProcessBreadcrumbs(
            detail,
            getProcessTabLabel(this.currentTabId()),
            this.selectedViewId(),
          )
        : this.breadcrumbs(),
    );
  }
}
