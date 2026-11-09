import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '../../core/auth/auth.service';
import { RoleHomePageComponent } from './role-home.page';

describe('RoleHomePageComponent', () => {
  it('should redirect to the current role home after Angular initializes the component', async () => {
    const getDefaultRoute = vi.fn().mockReturnValue('/processes');
    const navigateByUrl = vi.fn().mockResolvedValue(true);
    await TestBed.configureTestingModule({
      imports: [RoleHomePageComponent],
      providers: [
        { provide: AuthService, useValue: { getDefaultRoute } },
        { provide: Router, useValue: { navigateByUrl } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RoleHomePageComponent);
    fixture.detectChanges();

    expect(getDefaultRoute).toHaveBeenCalledOnce();
    expect(navigateByUrl).toHaveBeenCalledWith('/processes');
  });
});
