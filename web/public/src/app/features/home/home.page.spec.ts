import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { PublicPortalApiService } from '../../core/api/public-portal-api.service';
import { HomePageComponent } from './home.page';

describe('HomePageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        {
          provide: PublicPortalApiService,
          useValue: {
            searchCatalog: vi.fn().mockReturnValue(of({ query: '', total: 0, results: [] })),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the home page with quick access cards', () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});

