import { TestBed } from '@angular/core/testing';

import { VersionLifecyclePanelComponent } from './version-lifecycle-panel.component';

describe('VersionLifecyclePanelComponent', () => {
  it('should compile its standalone component definition', async () => {
    await TestBed.configureTestingModule({
      imports: [VersionLifecyclePanelComponent],
    }).compileComponents();

    expect(VersionLifecyclePanelComponent).toBeDefined();
  });
});
