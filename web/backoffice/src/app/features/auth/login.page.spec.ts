import { TestBed } from '@angular/core/testing';

import { LoginPageComponent } from './login.page';

describe('LoginPageComponent', () => {
  it('compiles its standalone component definition', async () => {
    await TestBed.configureTestingModule({ imports: [LoginPageComponent] }).compileComponents();

    expect(LoginPageComponent).toBeDefined();
  });
});
