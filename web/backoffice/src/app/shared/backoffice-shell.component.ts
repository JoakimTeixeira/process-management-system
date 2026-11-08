import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AuthService } from '../core/auth/auth.service';
import { BreadcrumbService } from '../core/navigation/breadcrumb.service';

interface NavItem {
  label: string;
  icon: string;
  href: string;
}

@Component({
  selector: 'app-backoffice-shell',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatToolbarModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './backoffice-shell.component.html',
  styleUrl: './backoffice-shell.component.scss',
  host: {
    class: 'app-shell',
  },
})
export class BackofficeShellComponent {
  protected readonly auth = inject(AuthService);
  protected readonly breadcrumbs = inject(BreadcrumbService);
  private readonly router = inject(Router);

  protected readonly isMobileMenuOpen = signal(false);

  protected readonly navItems = computed<NavItem[]>(() => {
    const role = this.auth.currentUser()?.role.name;
    const contentIcons: Record<string, readonly [string, string]> = {
      EDITOR: ['account_tree', 'assignment'],
      REVIEWER: ['fact_check', 'assignment_turned_in'],
      PUBLISHER: ['publish', 'description'],
      VIEWER: ['visibility', 'article'],
    };

    if (role === 'SYSTEM_ADMIN') {
      return [
        { label: 'Users', icon: 'person', href: '/admin/users' },
        { label: 'Teams', icon: 'groups', href: '/admin/teams' },
      ];
    }

    const icons = role ? contentIcons[role] : undefined;
    if (!icons) {
      return [];
    }

    const baseItems: NavItem[] = [
      { label: 'Processes', icon: icons[0], href: '/processes' },
      { label: 'Procedures', icon: icons[1], href: '/procedures' },
      { label: 'Glossary', icon: 'menu_book', href: '/glossary' },
    ];

    return role === 'EDITOR'
      ? [{ label: 'Areas', icon: 'domain', href: '/areas' }, ...baseItems]
      : baseItems;
  });

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  protected isNavItemActive(href: string): boolean {
    const currentUrl = this.router.url;
    return currentUrl === href || currentUrl.startsWith(href + '/');
  }
}
