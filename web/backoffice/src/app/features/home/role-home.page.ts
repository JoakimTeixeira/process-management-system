import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-role-home-page',
  imports: [CommonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section style="display:grid;place-items:center;min-height:16rem;">
      <mat-progress-spinner mode="indeterminate" />
    </section>
  `,
})
export class RoleHomePageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    void this.router.navigateByUrl(this.auth.getDefaultRoute());
  }
}
