import { Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BreadcrumbItem } from './breadcrumbs.builder';
import { BreadcrumbsComponent } from './breadcrumbs.component';

interface BreadcrumbsHarness {
  items: Signal<BreadcrumbItem[]>;
}

describe('BreadcrumbsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbsComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render linked ancestors and a plain-text current item from a signal input', () => {
    const fixture = TestBed.createComponent(BreadcrumbsComponent);
    const component = fixture.componentInstance as unknown as BreadcrumbsHarness;
    const items: BreadcrumbItem[] = [
      { label: 'Processes', link: '/catalog/processes', queryParams: { areaId: 'area-1' } },
      { label: 'Incident Management' },
    ];

    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();

    expect(typeof component.items).toBe('function');
    expect(component.items()).toEqual(items);

    const links = fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe('/catalog/processes?areaId=area-1');
    expect(fixture.nativeElement.textContent).toContain('Incident Management');
  });
});
