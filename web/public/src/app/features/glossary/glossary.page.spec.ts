import { Signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';

import { PublicPortalApiService } from '../../core/api/public-portal-api.service';
import { PublicGlossaryResponse } from '../../core/models/public-portal.models';
import { GlossaryPageComponent } from './glossary.page';

interface GlossaryPageHarness {
  categories: Signal<string[]>;
  filteredTerms: Signal<PublicGlossaryResponse['terms']>;
  loading: Signal<boolean>;
  searchTerm: WritableSignal<string>;
  selectedCategory: WritableSignal<string>;
  clearFilters(): void;
}

describe('GlossaryPageComponent', () => {
  const glossary: PublicGlossaryResponse = {
    terms: [
      {
        id: 'term-1',
        term: 'Incident',
        definition: 'An unplanned interruption to a service.',
        category: 'Operations',
        isPreferred: true,
        createdBy: null,
      },
      {
        id: 'term-2',
        term: 'Value',
        definition: 'Perceived benefits, usefulness, and importance.',
        category: null,
        isPreferred: true,
        createdBy: null,
      },
    ],
    practices: [
      {
        id: 'practice-1',
        code: 'IM',
        name: 'Incident Management',
        description: 'Restore normal service operation quickly.',
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlossaryPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        {
          provide: PublicPortalApiService,
          useValue: { getGlossary: vi.fn().mockReturnValue(of(glossary)) },
        },
      ],
    }).compileComponents();
  });

  it('loads glossary data and filters terms by search and normalized category labels', () => {
    const fixture = TestBed.createComponent(GlossaryPageComponent);
    const page = fixture.componentInstance as unknown as GlossaryPageHarness;
    fixture.detectChanges();

    expect(page.loading()).toBe(false);
    expect(page.categories()).toEqual(['General', 'Operations']);

    page.searchTerm.set('benefits');
    expect(page.filteredTerms().map((term) => term.term)).toEqual(['Value']);

    page.searchTerm.set('');
    page.selectedCategory.set('Operations');
    expect(page.filteredTerms().map((term) => term.term)).toEqual(['Incident']);

    page.clearFilters();
    expect(page.filteredTerms()).toEqual(glossary.terms);
  });

  it('releases its glossary request when the page is destroyed', () => {
    const response$ = new Subject<PublicGlossaryResponse>();
    const api = TestBed.inject(PublicPortalApiService);
    vi.mocked(api.getGlossary).mockReturnValue(response$);

    const fixture = TestBed.createComponent(GlossaryPageComponent);
    fixture.detectChanges();

    expect(response$.observed).toBe(true);

    fixture.destroy();

    expect(response$.observed).toBe(false);
  });
});
