import { TestBed } from '@angular/core/testing';

import { UserListPageComponent } from './user-list.page';

describe('UserListPageComponent', () => {
  it('should compile its standalone component definition', async () => {
    await TestBed.configureTestingModule({ imports: [UserListPageComponent] }).compileComponents();

    expect(UserListPageComponent).toBeDefined();
  });
});
