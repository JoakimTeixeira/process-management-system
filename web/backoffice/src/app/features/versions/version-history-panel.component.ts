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
  templateUrl: './version-history-panel.component.html',
  styleUrl: './version-history-panel.component.scss',
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
