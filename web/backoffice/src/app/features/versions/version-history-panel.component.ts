import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import {
  AssetRecord,
  AuditLogRecord,
  ProcessVersionRecord,
  VersionStateHistoryRecord,
} from '../../core/models/backoffice.models';
import { getAssetMimeTypeLabel, getAssetRevisionLabel } from './version-asset-panel.component';

@Component({
  selector: 'app-version-history-panel',
  imports: [DatePipe, MatCardModule, MatDividerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="detail-frame__body">
      <mat-card appearance="outlined">
        <mat-card-content>
          <div class="work-card-header">
            <h3 class="work-card-title">Change description</h3>
            <p>{{ version().changeDescription }}</p>
          </div>
          <div class="work-card-header">
            <h3 class="work-card-title">Reason for change</h3>
            <p>{{ version().reasonForChange }}</p>
          </div>

          @if (historyAvailable()) {
            <mat-divider style="margin: 2.5rem 0;"></mat-divider>

            <div class="work-card-header">
              <h3 class="work-card-title">Lifecycle history</h3>
              @if (stateHistory().length === 0) {
                <p class="muted">No transitions recorded.</p>
              } @else {
                <div class="history-list">
                  @for (entry of stateHistory(); track entry.id) {
                    <mat-card appearance="outlined">
                      <mat-card-content>
                        <strong
                          >{{ entry.fromState || '' }} {{ entry.fromState ? '→' : '' }}
                          {{ entry.toState }}</strong
                        >
                        <p class="muted">{{ entry.createdAt | date: 'medium' }}</p>
                        <p>{{ entry.reason || 'No reason provided.' }}</p>
                        <p class="muted">{{ entry.actorName || entry.actorId || 'Unknown' }}</p>
                      </mat-card-content>
                    </mat-card>
                  }
                </div>
              }
            </div>

            <mat-divider style="margin: 2.5rem 0;"></mat-divider>

            <div class="work-card-header">
              <h3 class="work-card-title">Audit history</h3>
              @if (auditLogs().length === 0) {
                <p class="muted">No audit entries.</p>
              } @else {
                <div class="history-list">
                  @for (log of auditLogs(); track log.id) {
                    <mat-card appearance="outlined">
                      <mat-card-content>
                        <strong>{{ log.action }}</strong>
                        <p class="muted">{{ log.createdAt | date: 'medium' }}</p>
                        <p>{{ log.reasonForChange }}</p>
                        <p class="muted">{{ log.actorName || log.actorId || 'Unknown' }}</p>
                      </mat-card-content>
                    </mat-card>
                  }
                </div>
              }
            </div>

            <mat-divider style="margin: 2.5rem 0;"></mat-divider>

            <div class="work-card-header">
              <h3 class="work-card-title">Asset supersede history</h3>
              @if (supersededAssets().length === 0) {
                <p class="muted">No asset supersede history.</p>
              } @else {
                <div class="history-list">
                  @for (asset of supersededAssets(); track asset.id) {
                    <mat-card appearance="outlined">
                      <mat-card-content>
                        <strong>{{ revisionLabel(asset) }} - {{ asset.caption }}</strong>
                        <p class="muted">
                          Process version v{{ version().versionNumber }} - Uploaded
                          {{ asset.createdAt | date: 'medium' }}
                        </p>
                        <p class="muted">
                          {{ mimeTypeLabel(asset) }} - {{ asset.sizeBytes }} bytes
                        </p>
                        @if (asset.supersededAt) {
                          <p class="muted">Superseded: {{ asset.supersededAt | date: 'medium' }}</p>
                        }
                      </mat-card-content>
                    </mat-card>
                  }
                </div>
              }
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class VersionHistoryPanelComponent {
  readonly version = input.required<ProcessVersionRecord>();
  readonly historyAvailable = input.required<boolean>();
  readonly stateHistory = input.required<VersionStateHistoryRecord[]>();
  readonly auditLogs = input.required<AuditLogRecord[]>();
  readonly assets = input.required<AssetRecord[]>();
  readonly supersededAssets = input.required<AssetRecord[]>();

  protected revisionLabel(asset: AssetRecord): string {
    return getAssetRevisionLabel(asset, this.assets());
  }

  protected mimeTypeLabel(asset: AssetRecord): string {
    return getAssetMimeTypeLabel(asset);
  }
}
