import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { BreadcrumbService } from './breadcrumb.service';

@Component({
  standalone: true,
  template: '',
})
class StubPageComponent {}

describe('BreadcrumbService', () => {
  let router: Router;
  let service: BreadcrumbService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'processes',
            component: StubPageComponent,
            data: { breadcrumb: 'Processes', breadcrumbVisible: false },
          },
          {
            path: 'processes/:id/versions',
            component: StubPageComponent,
            data: {
              breadcrumb: [
                { label: 'Processes', url: '/processes' },
                { label: 'Versions' },
              ],
            },
          },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    service = TestBed.inject(BreadcrumbService);
  });

  it('builds breadcrumbs from route data', async () => {
    await router.navigateByUrl('/processes/abc/versions');

    expect(service.items()).toEqual([
      { label: 'Processes', url: '/processes' },
      { label: 'Versions' },
    ]);
    expect(service.isVisible()).toBeTrue();
  });

  it('prefers scoped overrides and restores route breadcrumbs when cleared', async () => {
    const owner = Symbol('breadcrumb-spec');
    await router.navigateByUrl('/processes');

    service.setOverride(owner, [
      { label: 'Processes', url: '/processes' },
      { label: 'Change control' },
      { label: 'Versions' },
    ]);

    expect(service.items()).toEqual([
      { label: 'Processes', url: '/processes' },
      { label: 'Change control' },
      { label: 'Versions' },
    ]);

    service.clearOverride(owner);

    expect(service.items()).toEqual([{ label: 'Processes', url: '/processes' }]);
  });

  it('hides breadcrumbs for entry routes that opt out, while preserving items', async () => {
    await router.navigateByUrl('/processes');

    expect(service.items()).toEqual([{ label: 'Processes', url: '/processes' }]);
    expect(service.isVisible()).toBeFalse();
  });
});
