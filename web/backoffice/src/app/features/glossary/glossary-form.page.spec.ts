import { TestBed } from '@angular/core/testing';

import { GlossaryFormPageComponent } from './glossary-form.page';

describe('GlossaryFormPageComponent', () => {
  it('compiles its standalone component definition', async () => {
    await TestBed.configureTestingModule({
      imports: [GlossaryFormPageComponent],
    }).compileComponents();

    expect(GlossaryFormPageComponent).toBeDefined();
  });
});
