import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { PublicPortalApiService } from '../../core/api/public-portal-api.service';
import { PublicGlossaryResponse } from '../../core/models/public-portal.models';
import { mapGlossaryResponse } from '../../core/ui/glossary.mapper';
import { buildStaticBreadcrumbs } from '../../shared/breadcrumbs/breadcrumbs.builder';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-glossary-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    BreadcrumbsComponent,
  ],
  templateUrl: './glossary.page.html',
  styleUrl: './glossary.page.scss',
})
export class GlossaryPageComponent {
  private readonly publicPortalApi = inject(PublicPortalApiService);

  protected readonly breadcrumbs = buildStaticBreadcrumbs('Glossary');
  protected readonly glossary = signal<PublicGlossaryResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly terms = computed(() => this.glossary()?.terms ?? []);
  protected readonly practices = computed(() => this.glossary()?.practices ?? []);

  protected readonly searchTerm = signal('');
  protected readonly selectedCategory = signal<string>('');

  protected readonly categories = computed(() => {
    const allTerms = this.terms();
    const uniqueCategories = new Set(allTerms.map((t) => t.category || 'General'));
    return Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b));
  });

  protected readonly filteredTerms = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();
    const allTerms = this.terms();

    return allTerms.filter((item) => {
      const itemCategory = item.category || 'General';
      if (category && itemCategory !== category) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [item.term, item.definition, itemCategory].join(' ').toLowerCase();

      return haystack.includes(query);
    });
  });

  constructor() {
    this.publicPortalApi.getGlossary().subscribe({
      next: (response) => {
        this.glossary.set(mapGlossaryResponse(response));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('The public glossary could not be loaded.');
      },
    });
  }

  protected handleSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('');
  }
}
