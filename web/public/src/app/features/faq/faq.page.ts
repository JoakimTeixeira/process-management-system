import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';

import { buildStaticBreadcrumbs } from '../../shared/breadcrumbs/breadcrumbs.builder';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs/breadcrumbs.component';
import { faqItems } from './faq.content';

@Component({
  selector: 'app-faq-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatExpansionModule, BreadcrumbsComponent],
  templateUrl: './faq.page.html',
  styleUrl: './faq.page.scss',
})
export class FaqPageComponent {
  protected readonly breadcrumbs = buildStaticBreadcrumbs('FAQ');
  protected readonly items = faqItems;
}
