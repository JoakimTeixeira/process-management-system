import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { BreadcrumbItem } from './breadcrumbs.builder';

@Component({
  selector: 'app-breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <nav aria-label="Breadcrumb" class="breadcrumbs">
      @for (item of items; track item.label; let last = $last) {
        <span class="breadcrumb-item">
          @if (item.link && !last) {
            <a [routerLink]="item.link" [queryParams]="item.queryParams">
              {{ item.label }}
            </a>
          } @else {
            <span>{{ item.label }}</span>
          }
          @if (!last) {
            <mat-icon aria-hidden="true">chevron_right</mat-icon>
          }
        </span>
      }
    </nav>
  `,
  styles: `
    .breadcrumbs {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-1);
      margin: 0 0 var(--spacing-2-5);
      color: var(--portal-muted);
      font-size: var(--font-size-xs);
      font-style: italic;
    }

    .breadcrumb-item {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
    }

    a {
      color: var(--portal-muted);
      text-decoration: none;
    }

    a:hover {
      color: var(--portal-ink);
    }

    mat-icon {
      width: var(--font-size-sm);
      height: var(--font-size-sm);
      font-size: var(--font-size-sm);
      color: var(--portal-muted);
    }
  `,
})
export class BreadcrumbsComponent {
  @Input() items: BreadcrumbItem[] = [];
}
