import { TestBed } from '@angular/core/testing';

import { VersionAssetPanelComponent } from './version-asset-panel.component';

describe('VersionAssetPanelComponent', () => {
  it('compiles its standalone component definition', async () => {
    await TestBed.configureTestingModule({ imports: [VersionAssetPanelComponent] }).compileComponents();

    expect(VersionAssetPanelComponent).toBeDefined();
  });
});
