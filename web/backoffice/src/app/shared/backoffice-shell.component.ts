import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    CommonModule,
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

    switch (role) {
      case 'EDITOR':
        return [
          { label: 'Areas', icon: 'domain', href: '/areas' },
          { label: 'Processes', icon: 'account_tree', href: '/processes' },
          { label: 'Procedures', icon: 'assignment', href: '/procedures' },
          { label: 'Glossary', icon: 'menu_book', href: '/glossary' },
        ];
      case 'REVIEWER':
        return [
          { label: 'Processes', icon: 'fact_check', href: '/processes' },
          { label: 'Procedures', icon: 'assignment_turned_in', href: '/procedures' },
          { label: 'Glossary', icon: 'menu_book', href: '/glossary' },
        ];
      case 'PUBLISHER':
        return [
          { label: 'Processes', icon: 'publish', href: '/processes' },
          { label: 'Procedures', icon: 'description', href: '/procedures' },
          { label: 'Glossary', icon: 'menu_book', href: '/glossary' },
        ];
      case 'VIEWER':
        return [
          { label: 'Processes', icon: 'visibility', href: '/processes' },
          { label: 'Procedures', icon: 'article', href: '/procedures' },
          { label: 'Glossary', icon: 'menu_book', href: '/glossary' },
        ];
      case 'SYSTEM_ADMIN':
        return [
          { label: 'Users', icon: 'person', href: '/admin/users' },
          { label: 'Teams', icon: 'groups', href: '/admin/teams' },
        ];
      default:
        return [];
    }
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
