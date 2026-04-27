import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  PRIMARY_OUTLET,
  Router,
  UrlSegment,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

type BreadcrumbDefinition = string | BreadcrumbItem | BreadcrumbItem[];

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly routeChange = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  private readonly overrideItems = signal<BreadcrumbItem[] | null>(null);
  private currentOwner: symbol | null = null;

  readonly items = computed(() => {
    this.routeChange();
    return this.overrideItems() ?? this.buildItems(this.router.routerState.snapshot.root);
  });
  readonly isVisible = computed(() => {
    this.routeChange();
    return this.items().length > 0 && this.isCurrentRouteBreadcrumbVisible();
  });

  setOverride(owner: symbol, items: BreadcrumbItem[]): void {
    this.currentOwner = owner;
    this.overrideItems.set(items);
  }

  clearOverride(owner: symbol): void {
    if (this.currentOwner !== owner) {
      return;
    }

    this.currentOwner = null;
    this.overrideItems.set(null);
  }

  private buildItems(root: ActivatedRouteSnapshot): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [];
    let currentRoute: ActivatedRouteSnapshot | null = root;
    let currentUrl = '';

    while (currentRoute) {
      const primaryChild: ActivatedRouteSnapshot | null =
        currentRoute.children.find((child) => child.outlet === PRIMARY_OUTLET) ?? null;

      if (!primaryChild) {
        break;
      }

      const routePath = primaryChild.url
        .map((segment: UrlSegment) => segment.path)
        .join('/');
      if (routePath) {
        currentUrl += `/${routePath}`;
      }

      this.pushRouteItems(
        items,
        primaryChild.data['breadcrumb'] as BreadcrumbDefinition | undefined,
        currentUrl,
      );
      currentRoute = primaryChild;
    }

    return items;
  }

  private isCurrentRouteBreadcrumbVisible(): boolean {
    let currentRoute: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;

    while (currentRoute) {
      const primaryChild: ActivatedRouteSnapshot | null =
        currentRoute.children.find((child) => child.outlet === PRIMARY_OUTLET) ?? null;

      if (!primaryChild) {
        break;
      }

      currentRoute = primaryChild;
    }

    return currentRoute?.data['breadcrumbVisible'] !== false;
  }

  private pushRouteItems(
    items: BreadcrumbItem[],
    definition: BreadcrumbDefinition | undefined,
    currentUrl: string,
  ): void {
    if (!definition) {
      return;
    }

    if (typeof definition === 'string') {
      items.push({ label: definition, url: currentUrl || '/' });
      return;
    }

    if (Array.isArray(definition)) {
      items.push(...definition);
      return;
    }

    items.push({
      label: definition.label,
      url: definition.url ?? (currentUrl || '/'),
    });
  }
}
