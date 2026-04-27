import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { BackofficeApiService } from '../api/backoffice-api.service';
import { AppRole, CurrentUser } from '../models/backoffice.models';
import { ToastService } from '../toast/toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly STORAGE_KEY = 'backoffice.jwt';

  private readonly api = inject(BackofficeApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  private readonly tokenState = signal<string | null>(this.readStoredToken());
  private readonly currentUserState = signal<CurrentUser | null>(null);
  private readonly readyState = signal(false);
  private restorePromise: Promise<void> | null = null;

  readonly token = this.tokenState.asReadonly();
  readonly currentUser = this.currentUserState.asReadonly();
  readonly isReady = this.readyState.asReadonly();
  readonly isAuthenticated = computed(
    () => this.tokenState() !== null && this.currentUserState() !== null,
  );

  async restoreSession(): Promise<void> {
    if (this.readyState()) {
      return;
    }

    if (!this.tokenState()) {
      this.readyState.set(true);
      return;
    }

    if (this.restorePromise) {
      return await this.restorePromise;
    }

    this.restorePromise = firstValueFrom(this.api.getMe())
      .then((user) => {
        this.currentUserState.set(user);
      })
      .catch(() => {
        this.clearSession(false);
      })
      .finally(() => {
        this.readyState.set(true);
        this.restorePromise = null;
      });

    return await this.restorePromise;
  }

  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(this.api.login({ email, password }));

    this.tokenState.set(response.accessToken);
    this.writeStoredToken(response.accessToken);

    const currentUser = await firstValueFrom(this.api.getMe());

    this.currentUserState.set(currentUser);
    this.readyState.set(true);
  }

  logout(): void {
    this.clearSession(true);
  }

  handleUnauthorized(): void {
    this.toast.error('Your session has expired. Please log in again.');
    this.clearSession(true);
  }

  getDefaultRoute(roleName = this.currentUserState()?.role.name): string {
    switch (roleName) {
      case 'EDITOR':
        return '/areas';
      case 'REVIEWER':
      case 'PUBLISHER':
      case 'VIEWER':
        return '/processes';
      case 'SYSTEM_ADMIN':
        return '/admin/users';
      default:
        return '/login';
    }
  }

  hasRole(...roles: AppRole[]): boolean {
    const roleName = this.currentUserState()?.role.name;
    return roleName !== undefined && roles.includes(roleName);
  }

  private clearSession(redirect: boolean): void {
    this.tokenState.set(null);
    this.currentUserState.set(null);
    this.readyState.set(true);
    localStorage.removeItem(AuthService.STORAGE_KEY);

    if (redirect) {
      void this.router.navigate(['/login']);
    }
  }

  private readStoredToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(AuthService.STORAGE_KEY);
  }

  private writeStoredToken(token: string): void {
    localStorage.setItem(AuthService.STORAGE_KEY, token);
  }
}
