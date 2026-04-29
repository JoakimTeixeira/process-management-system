import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AccessControlUtil } from '../../core/governance/access-control.util';
import { AreaRecord, ProcessRecord } from '../../core/models/backoffice.models';
import { getHttpErrorMessage } from '../../core/http/http-error-message';

@Component({
  selector: 'app-area-detail-page',
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
        margin-bottom: 2rem;
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

      .detail-grid {
        display: grid;
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .detail-card {
        padding: 1.5rem;
      }

      .detail-row {
        display: flex;
        gap: 1rem;
        margin-bottom: 0.75rem;
      }

      .detail-label {
        font-weight: 600;
        color: #5f6368;
        min-width: 120px;
      }

      .detail-value {
        flex: 1;
      }

      .processes-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
      }

      .processes-table th,
      .processes-table td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      .processes-table th {
        font-weight: 600;
        color: #5f6368;
      }

      .processes-table tr:last-child td {
        border-bottom: none;
      }
    `,
  ],
  template: `
    <section class="page">
      <section class="bo-page-intro page-header">
        <div class="header-row">
          <div class="bo-page-intro__copy">
            @if (area(); as area) {
              <h1>{{ area.title }}</h1>
              <p class="muted">{{ area.code }} - {{ area.itilPractice.name }}</p>
            } @else {
              <h1>Area Details</h1>
              <p class="muted">Loading area information...</p>
            }
          </div>
          @if (area(); as area) {
            <a mat-flat-button color="primary" [routerLink]="['/areas', area.id, 'edit']">
              <mat-icon>edit</mat-icon>
              Edit area
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
      } @else if (area(); as area) {
        <div class="detail-grid">
          <!-- Area Information -->
          <mat-card appearance="outlined" class="detail-card">
            <h2>Area Information</h2>
            <div class="detail-row">
              <div class="detail-label">Code:</div>
              <div class="detail-value">{{ area.code }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Title:</div>
              <div class="detail-value">{{ area.title }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">ITIL Practice:</div>
              <div class="detail-value">
                <mat-chip>{{ area.itilPractice.name }}</mat-chip>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Owner:</div>
              <div class="detail-value">
                <mat-chip>{{ area.ownerName }}</mat-chip>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Team:</div>
              <div class="detail-value">
                <mat-chip>{{ area.teamName }}</mat-chip>
              </div>
            </div>
            @if (area.description) {
              <div class="detail-row">
                <div class="detail-label">Description:</div>
                <div class="detail-value">{{ area.description }}</div>
              </div>
            }
          </mat-card>

          <!-- Processes in this Area -->
          <mat-card appearance="outlined" class="detail-card">
            <h2>Processes ({{ processes().length }})</h2>
            @if (processes().length === 0) {
              <p class="muted">No processes have been created for this area yet.</p>
            } @else {
              <table mat-table [dataSource]="processes()" class="processes-table">
                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef>Title</th>
                  <td mat-cell *matCellDef="let process">{{ process.title }}</td>
                </ng-container>

                <ng-container matColumnDef="code">
                  <th mat-header-cell *matHeaderCellDef>Code</th>
                  <td mat-cell *matCellDef="let process">{{ process.code }}</td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let process">
                    @if (process.description) {
                      {{ process.description }}
                    } @else {
                      <span class="muted">No description</span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let process">
                    <a mat-icon-button [routerLink]="['/processes', process.id, 'versions']" aria-label="View processes">
                      <mat-icon>open_in_new</mat-icon>
                    </a>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['title', 'code', 'description', 'actions']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['title', 'code', 'description', 'actions']"></tr>
              </table>
            }
          </mat-card>
        </div>
      }
    </section>
  `,
})
export class AreaDetailPageComponent implements OnInit {
  private readonly api = inject(BackofficeApiService);
  private readonly accessControl = inject(AccessControlUtil);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly area = signal<AreaRecord | null>(null);
  protected readonly processes = signal<ProcessRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly canEdit = computed(() => this.accessControl.hasRole('EDITOR'));

  ngOnInit(): void {
    void this.loadAreaData();
  }

  private async loadAreaData(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const areaId = this.route.snapshot.paramMap.get('id');
      if (!areaId) {
        this.errorMessage.set('Area ID not provided');
        return;
      }

      const [area, processes] = await Promise.all([
        firstValueFrom(this.api.getArea(areaId)),
        firstValueFrom(this.api.listProcesses()),
      ]);

      this.area.set(area);
      this.processes.set(processes.filter(process => process.areaId === areaId));
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load area information.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}
