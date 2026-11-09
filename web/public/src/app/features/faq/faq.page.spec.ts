import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { FaqPageComponent } from './faq.page';

describe('FaqPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render FAQ items and breadcrumbs', () => {
    const fixture = TestBed.createComponent(FaqPageComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});

