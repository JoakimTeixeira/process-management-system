import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { PublicPortalApiService } from '../../core/api/public-portal-api.service';
import { PublicCatalogSearchResult } from '../../core/models/public-portal.models';
import { CatalogSearchComponent } from './catalog-search.component';

describe('CatalogSearchComponent', () => {
  const result: PublicCatalogSearchResult = {
    kind: 'Asset',
    code: 'BPMN-001',
    title: 'Incident workflow',
    subtitle: 'Incident Management',
    href: '/processes/process-1/diagram/to-be',
  };
  const searchCatalog = vi.fn().mockReturnValue(of([result]));

  beforeEach(async () => {
    vi.useFakeTimers();
    searchCatalog.mockClear();

    await TestBed.configureTestingModule({
      imports: [CatalogSearchComponent],
      providers: [
        provideRouter([]),
        { provide: PublicPortalApiService, useValue: { searchCatalog } },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('normalizes API search links through the centralized route adapter', async () => {
    const fixture = TestBed.createComponent(CatalogSearchComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const label = fixture.nativeElement.querySelector(
      'label[for="catalog-search-input"]',
    ) as HTMLLabelElement;

    expect(input.id).toBe('catalog-search-input');
    expect(label.textContent).toContain('Search the catalog');

    input.value = 'incident';
    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(150);
    fixture.detectChanges();

    expect(searchCatalog).toHaveBeenCalledWith({ search: 'incident' });
    const link = fixture.nativeElement.querySelector(
      '.catalog-search__result',
    ) as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/catalog/processes/process-1/diagram?view=to-be');
  });

  it('closes a popover and clears its results after an outside document click', async () => {
    const fixture = TestBed.createComponent(CatalogSearchComponent);
    fixture.componentRef.setInput('mode', 'popover');
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.catalog-search__trigger') as HTMLButtonElement).click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'incident';
    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(150);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.catalog-search__result')).not.toBeNull();

    document.body.dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.catalog-search__panel')).toBeNull();
  });
});
