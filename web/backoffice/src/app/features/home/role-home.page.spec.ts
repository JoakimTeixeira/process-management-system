import { TestBed } from '@angular/core/testing';

import { RoleHomePageComponent } from './role-home.page';

describe('RoleHomePageComponent', () => {
  it('compiles its standalone component definition', async () => {
    await TestBed.configureTestingModule({ imports: [RoleHomePageComponent] }).compileComponents();

    expect(RoleHomePageComponent).toBeDefined();
  });
});
