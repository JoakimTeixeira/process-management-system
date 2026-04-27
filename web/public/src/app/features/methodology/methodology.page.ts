import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';

import { buildStaticBreadcrumbs } from '../../shared/breadcrumbs/breadcrumbs.builder';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs/breadcrumbs.component';
import { methodologySections } from './methodology.content';

@Component({
  selector: 'app-methodology-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatExpansionModule, BreadcrumbsComponent],
  templateUrl: './methodology.page.html',
  styleUrl: './methodology.page.scss',
})
export class MethodologyPageComponent {
  protected readonly breadcrumbs = buildStaticBreadcrumbs('Methodology');
  protected readonly sections = methodologySections;
}
