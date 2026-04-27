import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { CatalogSearchComponent } from './shared/catalog-search/catalog-search.component';

interface NavigationItem {
  label: string;
  link: string;
  exact?: boolean;
  matchPrefixes?: string[];
}

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, RouterLink, CatalogSearchComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);

  protected readonly currentYear = new Date().getFullYear();
  protected readonly navigationItems: NavigationItem[] = [
    { label: 'Home', link: '/', exact: true },
    {
      label: 'Processes',
      link: '/catalog/processes',
      matchPrefixes: ['/catalog/processes'],
    },
    {
      label: 'Procedures',
      link: '/catalog/procedures',
      matchPrefixes: ['/catalog/procedures'],
    },
    { label: 'Glossary', link: '/glossary' },
    { label: 'Methodology', link: '/methodology' },
    { label: 'FAQ', link: '/faq' },
  ];

  public isNavigationItemActive(item: NavigationItem): boolean {
    const currentPath = this.router.url.split('?')[0] ?? '/';

    if (item.exact) {
      return currentPath === item.link;
    }

    const matchPrefixes = item.matchPrefixes ?? [item.link];
    return matchPrefixes.some(
      (prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`),
    );
  }
}
