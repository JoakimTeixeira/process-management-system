import { TestBed } from '@angular/core/testing';

import { App } from './app';

describe('App', () => {
  it('compiles its standalone component definition', async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();

    expect(App).toBeDefined();
  });
});
