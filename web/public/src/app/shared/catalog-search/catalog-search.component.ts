import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { Params, RouterLink } from '@angular/router';
import { Subject, distinctUntilChanged, switchMap, tap, of, debounceTime, catchError } from 'rxjs';

import { PublicPortalApiService } from '../../core/api/public-portal-api.service';
import { PublicCatalogSearchResult } from '../../core/models/public-portal.models';

type CatalogSearchNavigationResult = PublicCatalogSearchResult & {
  normalizedHref: string;
  queryParams?: Params;
  routeSegments: string[];
  trackKey: string;
};

@Component({
  selector: 'app-catalog-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './catalog-search.component.html',
  styleUrl: './catalog-search.component.scss',
})
export class CatalogSearchComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef);
  private readonly publicPortalApi = inject(PublicPortalApiService);
  private readonly searchQueryChanges = new Subject<string>();

  mode = input<'inline' | 'popover'>('inline');
  heading = input('Find the service you are looking for');
  description = input('');
  placeholder = input('Search areas, processes, procedures, or assets...');
  triggerLabel = input('Search');
  emptyHint = input('Search by code, title, area, process, procedure, or asset.');
  emptyText = input('No published records found.');
  searchingText = input('Searching...');

  protected readonly isOpen = signal(false);
  protected readonly isSearching = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly searchResults = signal<CatalogSearchNavigationResult[]>([]);

  ngOnInit(): void {
    this.isOpen.set(this.mode() === 'inline');
    this.bindSearch();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: Event): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);
    if (!clickedInside) {
      if (this.mode() === 'popover' && this.isOpen()) {
        this.closeIfPopover();
      } else if (this.mode() === 'inline') {
        this.clearSearch();
      }
    }
  }

  protected toggleOpen(): void {
    this.isOpen.update((isOpen) => !isOpen);

    if (!this.isOpen()) {
      this.clearSearch();
    }
  }

  protected handleSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchQueryChanges.next(value);
  }

  protected handleResultSelection(): void {
    queueMicrotask(() => {
      if (this.mode() === 'popover') {
        this.closeIfPopover();
      } else {
        this.clearSearch();
      }
    });
  }

  protected formatResultHeadline(result: PublicCatalogSearchResult): string {
    return result.code === result.title ? result.title : `${result.code} - ${result.title}`;
  }

  private closeIfPopover(): void {
    if (this.mode() === 'popover') {
      this.isOpen.set(false);
      this.clearSearch();
    }
  }

  private clearSearch(): void {
    this.isSearching.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.searchQueryChanges.next('');
  }

  private bindSearch(): void {
    this.searchQueryChanges
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap((query) => {
          const normalizedQuery = query.trim();

          if (normalizedQuery === '') {
            this.isSearching.set(false);
            this.searchResults.set([]);
            return;
          }

          this.isSearching.set(true);
        }),
        switchMap((query) => {
          const normalizedQuery = query.trim();

          if (normalizedQuery === '') {
            return of<PublicCatalogSearchResult[]>([]);
          }

          return this.publicPortalApi
            .searchCatalog({ search: normalizedQuery })
            .pipe(catchError(() => of<PublicCatalogSearchResult[]>([])));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => {
        this.searchResults.set(this.mapSearchResults(results.slice(0, 12)));
        this.isSearching.set(false);
      });
  }

  private mapSearchResults(results: PublicCatalogSearchResult[]): CatalogSearchNavigationResult[] {
    const seenKeys = new Set<string>();

    return results
      .map((result) => this.mapSearchResult(result))
      .filter((result) => {
        const dedupeKey = `${result.kind}:${result.normalizedHref}`;

        if (seenKeys.has(dedupeKey)) {
          return false;
        }

        seenKeys.add(dedupeKey);
        return true;
      })
      .map((result, index) => ({
        ...result,
        trackKey: `${result.kind}:${result.normalizedHref}:${index}`,
      }));
  }

  private mapSearchResult(result: PublicCatalogSearchResult): CatalogSearchNavigationResult {
    const normalizedHref = this.normalizeSearchHref(result);
    const [routePath, queryParams] = this.parseNavigationTarget(normalizedHref);

    return {
      ...result,
      normalizedHref: this.serializeNavigationHref(routePath, queryParams),
      queryParams,
      routeSegments: this.buildRouteSegments(routePath),
      trackKey: '',
    };
  }

  private normalizeSearchHref(result: PublicCatalogSearchResult): string {
    const [path, query = ''] = result.href.split('?');

    if (path === '/processes' && query.includes('areaId=')) {
      return `/catalog/processes?${query}`;
    }

    if (path === '/procedures' && query === '') {
      return '/catalog/procedures';
    }

    const procedureDetailMatch = path.match(/^\/procedures\/([^/]+)$/i);

    if (procedureDetailMatch) {
      return `/catalog/procedures/${procedureDetailMatch[1]}`;
    }

    const legacyProcessDetailMatch = path.match(/^\/processes\/([^/]+)$/i);

    if (legacyProcessDetailMatch) {
      const queryString = query === '' ? '' : `?${query}`;

      return `/catalog/processes/${legacyProcessDetailMatch[1]}${queryString}`;
    }

    const legacyProcessViewMatch = path.match(/^\/processes\/([^/]+)\/(as-is|to-be)$/i);

    if (legacyProcessViewMatch) {
      const [, processId, view] = legacyProcessViewMatch;

      if (result.kind === 'Asset') {
        return `/catalog/processes/${processId}/diagram?view=${view.toLowerCase()}`;
      }

      return `/catalog/processes/${processId}?view=${view.toLowerCase()}`;
    }

    const legacyDiagramViewMatch = path.match(/^\/processes\/([^/]+)\/diagram\/(as-is|to-be)$/i);

    if (legacyDiagramViewMatch) {
      const [, processId, view] = legacyDiagramViewMatch;
      return `/catalog/processes/${processId}/diagram?view=${view.toLowerCase()}`;
    }

    const overviewProcessMatch = path.match(/^\/processes\/([^/]+)\/overview$/i);

    if (!overviewProcessMatch) {
      return result.href;
    }

    return query === ''
      ? `/catalog/processes/${overviewProcessMatch[1]}`
      : `/catalog/processes/${overviewProcessMatch[1]}?${query}`;
  }

  private parseNavigationTarget(
    href: string,
  ): [routePath: string, queryParams: Params | undefined] {
    const parsedUrl = new URL(href, 'https://process-portal.local');
    const queryParams = Object.fromEntries(parsedUrl.searchParams.entries());

    return [parsedUrl.pathname, Object.keys(queryParams).length > 0 ? queryParams : undefined];
  }

  private buildRouteSegments(routePath: string): string[] {
    const segments = routePath.split('/').filter(Boolean);

    if (segments.length === 0) {
      return ['/'];
    }

    return [`/${segments[0]}`, ...segments.slice(1)];
  }

  private serializeNavigationHref(routePath: string, queryParams?: Params): string {
    if (!queryParams) {
      return routePath;
    }

    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== null && value !== undefined) {
        searchParams.set(key, String(value));
      }
    }

    const query = searchParams.toString();

    return query === '' ? routePath : `${routePath}?${query}`;
  }
}
