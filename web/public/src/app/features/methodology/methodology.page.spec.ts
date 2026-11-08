import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MethodologyPageComponent } from './methodology.page';

describe('MethodologyPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MethodologyPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders methodology sections and breadcrumbs', () => {
    const fixture = TestBed.createComponent(MethodologyPageComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});

