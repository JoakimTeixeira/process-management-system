import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { GlossaryResponse } from '../../core/models/backoffice.models';
import { getHttpErrorMessage } from '../../core/http/http-error-message';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-glossary-page',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }

      .page-header {
        display: grid;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .header-row {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
      }

      .muted {
        color: #5f6368;
      }

      .center-state {
        display: grid;
        place-items: center;
        min-height: 12rem;
      }

      .term-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
      }

      .term-table th,
      .term-table td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      .term-table th {
        font-weight: 600;
        color: #5f6368;
      }

      .term-table tr:last-child td {
        border-bottom: none;
      }
    `,
  ],
  template: `
    <section class="page">
      <section class="bo-page-intro page-header">
        <div class="header-row">
          <div class="bo-page-intro__copy">
            <h1>Glossary</h1>
            <p class="muted">Manage ITIL practice definitions and glossary terms.</p>
          </div>
          @if (canEdit()) {
            <a mat-flat-button color="primary" [routerLink]="['/glossary', 'new']">
              <mat-icon>add</mat-icon>
              New term
            </a>
          }
        </div>
      </section>

      @if (isLoading()) {
        <section class="center-state bo-state-card">
          <mat-progress-spinner mode="indeterminate" />
        </section>
      } @else if (errorMessage(); as errorMessage) {
        <mat-card appearance="outlined">
          <mat-card-content>{{ errorMessage }}</mat-card-content>
        </mat-card>
      } @else if (glossary(); as glossary) {
        @if (glossary.terms.length === 0) {
          <mat-card appearance="outlined">
            <mat-card-content>No glossary terms exist yet.</mat-card-content>
          </mat-card>
        } @else {
          <mat-card appearance="outlined">
            <mat-card-content>
              <table mat-table [dataSource]="glossary.terms" class="term-table">
                <ng-container matColumnDef="term">
                  <th mat-header-cell *matHeaderCellDef>Term</th>
                  <td mat-cell *matCellDef="let term">{{ term.term }}</td>
                </ng-container>

                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>Category</th>
                  <td mat-cell *matCellDef="let term">{{ term.category || 'General' }}</td>
                </ng-container>

                <ng-container matColumnDef="definition">
                  <th mat-header-cell *matHeaderCellDef>Definition</th>
                  <td mat-cell *matCellDef="let term">{{ term.definition }}</td>
                </ng-container>

                <ng-container matColumnDef="isPreferred">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let term">
                    @if (term.isPreferred) {
                      <mat-chip>Preferred</mat-chip>
                    } @else {
                      <span class="muted">-</span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef style="text-align: right;">Actions</th>
                  <td mat-cell *matCellDef="let term" style="text-align: right;">
                    @if (canEdit()) {
                      <a mat-icon-button [routerLink]="['/glossary', term.id, 'edit']" aria-label="Edit term">
                        <mat-icon>edit</mat-icon>
                      </a>
                    }
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        }
      }
    </section>
  `,
})
export class GlossaryPageComponent implements OnInit {
  private readonly api = inject(BackofficeApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly glossary = signal<GlossaryResponse | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly canEdit = computed(() => this.auth.currentUser()?.role.name === 'EDITOR');
  protected readonly displayedColumns = ['term', 'category', 'definition', 'isPreferred', 'actions'];

  ngOnInit() {
    void this.loadGlossary();
  }

  private async loadGlossary(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.glossary.set(await firstValueFrom(this.api.getGlossary()));
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load the glossary.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}
