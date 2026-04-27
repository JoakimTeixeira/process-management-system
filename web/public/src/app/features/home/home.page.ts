import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { CatalogSearchComponent } from '../../shared/catalog-search/catalog-search.component';

interface HomeServiceCard {
  label: string;
  description: string;
  link: string;
  icon: string;
}

const QUICK_ACCESS_CARDS: HomeServiceCard[] = [
  {
    label: 'Processes',
    description: 'Open published processes and their details.',
    link: '/catalog/processes',
    icon: 'account_tree',
  },
  {
    label: 'Procedures',
    description: 'Open published procedures and their details.',
    link: '/catalog/procedures',
    icon: 'assignment',
  },
  {
    label: 'Glossary',
    description: 'Consult key terms and reference vocabulary.',
    link: '/glossary',
    icon: 'menu_book',
  },
  {
    label: 'Methodology',
    description: 'See how the repository is organized and interpreted.',
    link: '/methodology',
    icon: 'schema',
  },
  {
    label: 'FAQ',
    description: 'Read common questions about the portal.',
    link: '/faq',
    icon: 'help_outline',
  },
];

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule, CatalogSearchComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePageComponent {
  protected readonly quickAccessCards = QUICK_ACCESS_CARDS;
}
