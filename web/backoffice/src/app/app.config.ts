import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { authErrorInterceptor } from './core/http/auth-error.interceptor';
import { authTokenInterceptor } from './core/http/auth-token.interceptor';
import { ConfirmDeleteDialogComponent } from './shared/confirm-delete-dialog.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authTokenInterceptor, authErrorInterceptor]),
    ),
    provideAnimationsAsync(),
    MatSnackBarModule,
    provideAppInitializer(() => {
      return inject(AuthService).restoreSession();
    }),
  ],
};
