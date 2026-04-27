import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
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
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly publicPortalApi = inject(PublicPortalApiService);
  private loadedProcessId: string | null = null;

  protected detail: PublicProcessDetail | null = null;
  protected loading = true;
  protected historyLoading = false;
  protected errorMessage: string | null = null;
  protected activeTabId: ProcessTabId = 'default';
  protected breadcrumbs: BreadcrumbItem[] = [];
  protected historyItems: PublicProcessHistoryItem[] = [];
  protected selectedViewId: ViewSelection = 'as-is';
  protected compareLeftViewId: ViewSelection = 'as-is';
  protected compareRightViewId: ViewSelection = 'to-be';
  protected readonly getArchitectureLabel = getArchitectureLabel;
  protected readonly getArchitectureSubtitle = getArchitectureSubtitle;

  protected get tabDefinitions(): DetailTabDefinition[] {
    return buildProcessDetailTabDefinitions(
      this.selectedViewVersion,
      this.historyItems.length,
      this.versionOptions.length,
    );
  }

  protected get currentTabId(): Exclude<ProcessTabId, 'default'> {
    return getCurrentDetailTabId(this.activeTabId);
  }

  protected get showsViewSelector(): boolean {
    return showsProcessViewSelector(this.currentTabId);
  }

  protected get versionOptions(): { id: ViewSelection; label: string }[] {
    return buildProcessVersionOptions(this.detail);
  }

  protected get selectedViewVersion() {
    return getProcessVersionForView(this.detail, this.selectedViewId);
  }

  protected get compareLeftVersion() {
    return getProcessVersionForView(this.detail, this.compareLeftViewId);
  }

  protected get compareRightVersion() {
    return getProcessVersionForView(this.detail, this.compareRightViewId);
  }

  protected get compareLeftLabel(): string {
    return getViewLabel(this.compareLeftViewId);
  }

  protected get compareRightLabel(): string {
    return getViewLabel(this.compareRightViewId);
  }

  protected get compareLeftTitle(): string {
    return getCompareTitle(this.compareLeftVersion, this.compareLeftLabel);
  }

  protected get compareRightTitle(): string {
    return getCompareTitle(this.compareRightVersion, this.compareRightLabel);
  }

  protected get compareLeftSubtitle(): string {
    return getCompareSubtitle(this.compareLeftVersion, this.compareLeftLabel);
  }

  protected get compareRightSubtitle(): string {
    return getCompareSubtitle(this.compareRightVersion, this.compareRightLabel);
  }

  protected get canCompareViews(): boolean {
    return this.versionOptions.length > 1;
  }

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.data, this.route.queryParamMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([paramMap, data, queryParams]) => {
        this.activeTabId = readProcessDetailTabId(data, queryParams);
        this.selectedViewId = normalizeDetailViewSelection(queryParams.get('view'));
        this.compareLeftViewId = normalizeDetailViewSelection(queryParams.get('left'));
        this.compareRightViewId = normalizeDetailViewSelection(queryParams.get('right'), 'to-be');

        const processId = paramMap.get('processId');

        if (!processId) {
          this.errorMessage = 'The requested process could not be identified.';
          this.loading = false;
          this.cdr.markForCheck();
          return;
        }

        if (this.loadedProcessId !== processId || !this.detail) {
          this.loadProcess(processId);
          return;
        }

        this.syncVersionSelections();
        this.updateBreadcrumbs();
        this.cdr.markForCheck();
      });
  }

  protected handleTabChange(nextTab: Exclude<ProcessTabId, 'default'>): void {
    if (!this.detail) {
      return;
    }

    this.activeTabId = nextTab;
    void this.router.navigate([getProcessTabRoute(this.detail.process.id, nextTab)], {
      queryParams: buildProcessDetailQueryParams(
        nextTab,
        this.selectedViewId,
        this.compareLeftViewId,
        this.compareRightViewId,
      ),
      replaceUrl: true,
    });
  }

  protected handleViewSelection(viewId: 'as-is' | 'to-be'): void {
    if (!this.detail) {
      return;
    }

    this.selectedViewId = viewId;
    void this.router.navigate([getProcessTabRoute(this.detail.process.id, this.currentTabId)], {
      queryParams: buildProcessDetailQueryParams(
        this.currentTabId,
        this.selectedViewId,
        this.compareLeftViewId,
        this.compareRightViewId,
      ),
      replaceUrl: true,
    });
  }

  protected handleCompareSelection(side: 'left' | 'right', viewId: 'as-is' | 'to-be'): void {
    if (!this.detail) {
      return;
    }

    if (side === 'left') {
      this.compareLeftViewId = viewId;
      if (this.compareRightViewId === viewId) {
        this.compareRightViewId = viewId === 'as-is' ? 'to-be' : 'as-is';
      }
    } else {
      this.compareRightViewId = viewId;
      if (this.compareLeftViewId === viewId) {
        this.compareLeftViewId = viewId === 'as-is' ? 'to-be' : 'as-is';
      }
    }

    void this.router.navigate([getProcessTabRoute(this.detail.process.id, 'compare')], {
      queryParams: buildProcessDetailQueryParams(
        'compare',
        this.selectedViewId,
        this.compareLeftViewId,
        this.compareRightViewId,
      ),
      replaceUrl: true,
    });
  }

  protected countPublishedProcedures(): number {
    return countPublishedProcessProcedures(this.detail);
  }

  protected getPublishedViewsSummary(): string {
    return getPublishedProcessViewsSummary(this.detail);
  }

  protected formatHistoryDate(value?: string): string {
    return formatProcessHistoryDate(value);
  }

  protected isDiagramTab(): boolean {
    return this.currentTabId === 'diagram';
  }

  protected isProceduresTab(): boolean {
    return this.currentTabId === 'procedures';
  }

  protected isHistoryTab(): boolean {
    return this.currentTabId === 'history';
  }

  protected isCompareTab(): boolean {
    return this.currentTabId === 'compare';
  }

  private loadProcess(processId: string): void {
    this.loading = true;
    this.errorMessage = null;

    this.publicPortalApi
      .getProcessDetail(processId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.detail = detail;
          this.loadedProcessId = processId;
          this.syncVersionSelections();
          this.loading = false;
          this.updateBreadcrumbs();
          this.cdr.markForCheck();
          this.loadHistory(processId);
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'The requested public process could not be loaded.';
          this.cdr.markForCheck();
        },
      });
  }

  private loadHistory(processId: string): void {
    this.historyLoading = true;

    this.publicPortalApi
      .getProcessVersions(processId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (historyItems) => {
          this.historyItems = historyItems;
          this.historyLoading = false;
          this.updateBreadcrumbs();
          this.cdr.markForCheck();
        },
        error: () => {
          this.historyLoading = false;
          this.historyItems = [];
          this.cdr.markForCheck();
        },
      });
  }

  private syncVersionSelections(): void {
    const resolvedViews = resolveAvailableProcessViews(
      this.detail,
      this.selectedViewId,
      this.compareLeftViewId,
      this.compareRightViewId,
    );

    this.selectedViewId = resolvedViews.selectedViewId;
    this.compareLeftViewId = resolvedViews.compareLeftViewId;
    this.compareRightViewId = resolvedViews.compareRightViewId;
  }

  private updateBreadcrumbs(): void {
    this.breadcrumbs = this.detail
      ? buildProcessBreadcrumbs(
          this.detail,
          getProcessTabLabel(this.currentTabId),
          this.selectedViewId,
        )
      : this.breadcrumbs;
  }
}
