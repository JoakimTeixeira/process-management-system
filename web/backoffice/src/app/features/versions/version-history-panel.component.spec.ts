import { TestBed } from '@angular/core/testing';

import { VersionHistoryPanelComponent } from './version-history-panel.component';

describe('VersionHistoryPanelComponent', () => {
  it('should compile its standalone component definition', async () => {
    await TestBed.configureTestingModule({
      imports: [VersionHistoryPanelComponent],
    }).compileComponents();

    expect(VersionHistoryPanelComponent).toBeDefined();
  });
});
