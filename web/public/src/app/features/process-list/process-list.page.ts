import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, forkJoin } from 'rxjs';

import { PublicPortalApiService } from '../../core/api/public-portal-api.service';
import {
  ArchitectureState,
  PublicAreaSummary,
  PublicProcessSummary,
  PublicProcedureSummary,
} from '../../core/models/public-portal.models';
import {
  CatalogQueryState,
  CatalogTabId,
  buildCatalogQueryParams,
  readCatalogQueryState,
} from '../../core/ui/catalog-query-state';
import { getArchitectureLabel } from '../../core/ui/architecture-view.helpers';
import { buildCatalogBreadcrumbs } from '../../shared/breadcrumbs/breadcrumbs.builder';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs/breadcrumbs.component';
import {
  buildProcessOptions,
  CATALOG_ARCHITECTURE_OPTIONS,
  CatalogProcessOption,
  filterBaseProcedures,
  filterBaseProcesses,
  filterProcedures,
  filterProcesses,
  getCatalogPageDescription,
  getCatalogPageTitle,
  getCatalogRoute,
  getDefaultCatalogTab,
  getDefaultProcessView,
  getProcedureArchitectureLabel,
  getProcedureCountForProcess,
  getProcedureVersionLabel,
  getSelectedAreaLabel,
  getSelectedProcessLabel,
  normalizeSelectedProcessId,
} from './process-list.page.helpers';

@Component({
  selector: 'app-process-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    BreadcrumbsComponent,
  ],
  templateUrl: './process-list.page.html',
  styleUrl: './process-list.page.scss',
})
export class ProcessListPageComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly publicPortalApi = inject(PublicPortalApiService);

  protected readonly getArchitectureLabel = getArchitectureLabel;
  protected readonly getDefaultView = getDefaultProcessView;
  protected readonly getProcedureArchitectureLabel = getProcedureArchitectureLabel;
  protected readonly getProcedureVersionLabel = getProcedureVersionLabel;
  protected readonly architectureOptions = CATALOG_ARCHITECTURE_OPTIONS;

  protected readonly areas = signal<PublicAreaSummary[]>([]);
  protected readonly allProcesses = signal<PublicProcessSummary[]>([]);
  protected readonly allProcedures = signal<PublicProcedureSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly searchTerm = signal('');
  protected readonly selectedAreaId = signal('');
  protected readonly selectedArchitecture = signal<ArchitectureState | ''>('');
  protected readonly selectedProcessId = signal('');
  protected readonly activeTabId = signal<CatalogTabId>('processes');
  protected readonly pageTitle = signal('Processes');
  protected readonly pageDescription = signal(
    'Explore published processes, then narrow the list by area, keyword, or view.',
  );

  protected readonly breadcrumbs = computed(() => buildCatalogBreadcrumbs(this.activeTabId()));

  protected readonly selectedAreaLabel = computed(() => {
    return getSelectedAreaLabel(this.areas(), this.selectedAreaId());
  });

  protected readonly selectedArchitectureLabel = computed(() => {
    const selectedArchitecture = this.selectedArchitecture();
    return selectedArchitecture ? getArchitectureLabel(selectedArchitecture) : null;
  });

  protected readonly baseProcesses = computed(() =>
    filterBaseProcesses(this.allProcesses(), this.selectedAreaId(), this.selectedArchitecture()),
  );

  protected readonly processOptions = computed<CatalogProcessOption[]>(() =>
    buildProcessOptions(this.baseProcesses()),
  );

  protected readonly selectedProcessLabel = computed(() => {
    return getSelectedProcessLabel(this.processOptions(), this.selectedProcessId());
  });

  protected readonly baseProcedures = computed(() =>
    filterBaseProcedures(
      this.allProcedures(),
      this.selectedAreaId(),
      this.selectedArchitecture(),
      this.selectedProcessId(),
    ),
  );

  protected readonly filteredProcesses = computed(() =>
    filterProcesses(this.baseProcesses(), this.searchTerm()),
  );

  protected readonly filteredProcedures = computed(() =>
    filterProcedures(this.baseProcedures(), this.searchTerm()),
  );

  protected readonly hasActiveFilters = computed(
    () =>
      this.searchTerm().trim() !== '' ||
      this.selectedAreaId() !== '' ||
      this.selectedArchitecture() !== '' ||
      this.selectedProcessId() !== '',
  );

  protected readonly processBaseCount = computed(() => this.baseProcesses().length);
  protected readonly procedureBaseCount = computed(() => this.baseProcedures().length);

  ngOnInit(): void {
    this.bindRouteState();
    this.loadCatalogData();
  }

  protected handleSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.syncRouteState();
  }

  protected setAreaSelection(areaId: string): void {
    this.selectedAreaId.set(areaId);
    this.selectedProcessId.set('');
    this.ensureSelectedProcessIsValid();
    this.syncRouteState();
  }

  protected setArchitectureSelection(architecture: ArchitectureState | ''): void {
    this.selectedArchitecture.set(architecture);
    this.ensureSelectedProcessIsValid();
    this.syncRouteState();
  }

  protected setProcessSelection(processId: string): void {
    this.selectedProcessId.set(processId);
    this.syncRouteState();
  }

  protected resetFilters(): void {
    this.searchTerm.set('');
    this.selectedAreaId.set('');
    this.selectedArchitecture.set('');
    this.selectedProcessId.set('');
    this.syncRouteState();
  }

  protected getProcedureCountForProcess(processId: string): number {
    return getProcedureCountForProcess(processId, this.allProcedures());
  }

  private bindRouteState(): void {
    combineLatest([this.route.queryParamMap, this.route.data])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([queryParams, data]) => {
        const defaultTab = getDefaultCatalogTab(data['defaultCatalogTab']);
        const nextState = readCatalogQueryState(queryParams, defaultTab);

        this.pageTitle.set(getCatalogPageTitle(data['pageTitle'], nextState.tab));
        this.pageDescription.set(getCatalogPageDescription(nextState.tab));
        this.applyQueryState(nextState);
        this.cdr.markForCheck();
      });
  }

  private loadCatalogData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      areas: this.publicPortalApi.listAreas(),
      processes: this.publicPortalApi.listProcesses({}),
      procedures: this.publicPortalApi.listProcedures(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ areas, processes, procedures }) => {
          this.areas.set(areas);
          this.allProcesses.set(processes);
          this.allProcedures.set(procedures);
          this.loading.set(false);
          this.ensureSelectedProcessIsValid();
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('The public catalog could not be loaded.');
          this.cdr.markForCheck();
        },
      });
  }

  private applyQueryState(state: CatalogQueryState): void {
    this.searchTerm.set(state.search);
    this.selectedAreaId.set(state.areaId);
    this.selectedArchitecture.set(state.architecture);
    this.activeTabId.set(state.tab);
    this.selectedProcessId.set(state.processId);
    this.ensureSelectedProcessIsValid();
  }

  private ensureSelectedProcessIsValid(): void {
    this.selectedProcessId.set(
      normalizeSelectedProcessId(
        this.activeTabId(),
        this.selectedProcessId(),
        this.processOptions(),
      ),
    );
  }

  private syncRouteState(): void {
    void this.router.navigate([getCatalogRoute(this.activeTabId())], {
      queryParams: buildCatalogQueryParams({
        tab: this.activeTabId(),
        search: this.searchTerm().trim(),
        areaId: this.selectedAreaId(),
        architecture: this.selectedArchitecture(),
        processId: this.selectedProcessId(),
      }),
      replaceUrl: true,
    });
  }
}
