import { TestBed } from '@angular/core/testing';

import { VersionProcedurePanelComponent } from './version-procedure-panel.component';

describe('VersionProcedurePanelComponent', () => {
  it('compiles its standalone component definition', async () => {
    await TestBed.configureTestingModule({
      imports: [VersionProcedurePanelComponent],
    }).compileComponents();

    expect(VersionProcedurePanelComponent).toBeDefined();
  });
});
