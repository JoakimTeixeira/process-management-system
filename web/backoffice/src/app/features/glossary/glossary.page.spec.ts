import { TestBed } from '@angular/core/testing';

import { GlossaryPageComponent } from './glossary.page';

describe('GlossaryPageComponent', () => {
  it('compiles its standalone component definition', async () => {
    await TestBed.configureTestingModule({ imports: [GlossaryPageComponent] }).compileComponents();

    expect(GlossaryPageComponent).toBeDefined();
  });
});
