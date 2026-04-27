import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly config: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  success(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      ...this.config,
      panelClass: ['toast-success'],
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      ...this.config,
      duration: 5000,
      panelClass: ['toast-error'],
    });
  }
}
