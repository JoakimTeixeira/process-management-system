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
  host: {
    class: 'app-shell',
  },
  styleUrls: ['./backoffice-shell.component.scss'],
  template: `
    <a href="#main-content" class="skip-to-content">Skip to main content</a>

    <header class="shell-toolbar">
      <div class="shell-toolbar__inner">
        <button
          class="mobile-menu-toggle"
          mat-icon-button
          type="button"
          (click)="toggleMobileMenu()"
          (keydown.escape)="closeMobileMenu()"
          aria-label="Toggle navigation menu"
          [attr.aria-expanded]="isMobileMenuOpen()"
          [attr.aria-controls]="'mobile-menu'"
        >
          <mat-icon>menu</mat-icon>
        </button>

        <a class="shell-brand" routerLink="/">
          <span class="shell-brand__copy">
            <span class="shell-brand__title">Process Governance</span>
            <span class="shell-brand__subtitle">Backoffice</span>
          </span>
        </a>

        <span class="shell-spacer"></span>

        @if (auth.currentUser(); as currentUser) {
          <span class="shell-user">
            <mat-icon>account_circle</mat-icon>
            <span>{{ currentUser.name }} - {{ currentUser.role.name }}</span>
            @if (currentUser.team; as team) {
              <span>- {{ team.code }} {{ team.name }}</span>
            }
          </span>
        }

        <button mat-button type="button" (click)="auth.logout()">
          <mat-icon>logout</mat-icon>
          Logout
        </button>
      </div>
    </header>

    <div class="shell-nav-band">
      <div class="shell-container">
        <div class="shell-nav-band__inner">
          <nav
            class="shell-nav"
            [class.mobile-menu-open]="isMobileMenuOpen()"
            id="mobile-menu"
            aria-label="Primary navigation"
          >
            @for (item of navItems(); track item.href) {
              <a
                class="shell-nav-link"
                routerLinkActive="active-link"
                [routerLink]="item.href"
                [attr.aria-current]="isNavItemActive(item.href) ? 'page' : null"
              >
                <mat-icon>{{ item.icon }}</mat-icon>
                {{ item.label }}
              </a>
            }
          </nav>
        </div>
      </div>
    </div>

    <mat-divider class="shell-divider" />

    <div class="shell-breadcrumbs">
      <div class="shell-container">
        <div class="shell-breadcrumbs-slot">
          <nav
            class="shell-breadcrumbs"
            aria-label="Breadcrumb"
            [class.shell-breadcrumbs--hidden]="!breadcrumbs.isVisible()"
            [attr.aria-hidden]="!breadcrumbs.isVisible()"
          >
            @for (item of breadcrumbs.items(); track item.label + ':' + (item.url || 'current')) {
              @if (!$first) {
                <mat-icon class="shell-breadcrumbs__separator" aria-hidden="true">chevron_right</mat-icon>
              }
              @if (!$last && item.url) {
                <a class="shell-breadcrumbs__link" [routerLink]="item.url">{{ item.label }}</a>
              } @else {
                <span
                  class="shell-breadcrumbs__current"
                  [attr.aria-current]="$last ? 'page' : null"
                >
                  {{ item.label }}
                </span>
              }
            }
          </nav>
        </div>
      </div>
    </div>

    <main id="main-content">
      <div class="shell-container shell-main__inner">
        <router-outlet />
      </div>
    </main>
  `,
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
        return [{ label: 'Admin', icon: 'admin_panel_settings', href: '/admin/users' }];
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
