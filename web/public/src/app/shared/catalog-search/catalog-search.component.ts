import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
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
import {
  normalizeCatalogSearchHref,
  parseCatalogNavigationTarget,
  serializeCatalogNavigationTarget,
} from '../../core/routing/process-route.helper';

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
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
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
    const normalizedHref = normalizeCatalogSearchHref(result.kind, result.href);
    const { routePath, routeSegments, queryParams } = parseCatalogNavigationTarget(normalizedHref);

    return {
      ...result,
      normalizedHref: serializeCatalogNavigationTarget(routePath, queryParams),
      queryParams,
      routeSegments,
      trackKey: '',
    };
  }
}
