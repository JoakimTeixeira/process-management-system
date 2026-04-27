import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AppRole } from '../models/backoffice.models';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated()
    ? true
    : router.createUrlTree(['/login']);
};

export const anonymousOnlyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated()
    ? router.createUrlTree([authService.getDefaultRoute()])
    : true;
};

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data['roles'] as AppRole[] | undefined) ?? [];

  if (allowedRoles.length === 0) {
    return true;
  }

  const currentRole = authService.currentUser()?.role.name;

  return currentRole && allowedRoles.includes(currentRole)
    ? true
    : router.createUrlTree([authService.getDefaultRoute()]);
};
