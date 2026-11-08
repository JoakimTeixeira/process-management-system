import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import {
  AssetContentRecord,
  AssetRecord,
  ProcessVersionRecord,
} from '../../core/models/backoffice.models';
import { BackofficeBpmnViewerComponent } from '../../shared/bpmn/backoffice-bpmn-viewer.component';

export function getAssetRevisionLabel(asset: AssetRecord, assets: AssetRecord[]): string {
  const index = assets.findIndex((candidate) => candidate.id === asset.id);
  return `v${index >= 0 ? index + 1 : assets.length}`;
}

export function getAssetMimeTypeLabel(asset: AssetRecord): string {
  if (asset.mimeType === 'application/octet-stream' && /\.(bpmn|xml)$/i.test(asset.filePath)) {
    return 'application/xml';
  }

  return asset.mimeType;
}

@Component({
  selector: 'app-version-asset-panel',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    BackofficeBpmnViewerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './version-asset-panel.component.html',
  styleUrl: './version-asset-panel.component.scss',
})
export class VersionAssetPanelComponent {
  readonly version = input.required<ProcessVersionRecord>();
  readonly canUploadBpmn = input.required<boolean>();
  readonly uploadForm = input.required<FormGroup>();
  readonly selectedFileName = input<string | null>(null);
  readonly uploadErrorMessage = input<string | null>(null);
  readonly isUploading = input.required<boolean>();
  readonly uploadSubmitLabel = input.required<string>();
  readonly assets = input.required<AssetRecord[]>();
  readonly currentAssets = input.required<AssetRecord[]>();
  readonly previewAsset = input<AssetRecord | null>(null);
  readonly assetTimeline = input.required<AssetRecord[]>();
  readonly expandedPreviewAssetId = input<string | null>(null);
  readonly previewAssetContent = input<AssetContentRecord | null>(null);
  readonly expandedAssetXmlId = input<string | null>(null);
  readonly expandedAssetXmlContent = input<AssetContentRecord | null>(null);
  readonly diagramPreviewXml = input<string | null>(null);
  readonly diagramPreviewTitle = input.required<string>();
  readonly diagramPreviewSubtitle = input.required<string>();

  readonly fileSelected = output<Event>();
  readonly uploadRequested = output<void>();
  readonly previewToggled = output<AssetRecord>();
  readonly xmlToggled = output<AssetRecord>();

  protected revisionLabel(asset: AssetRecord): string {
    return getAssetRevisionLabel(asset, this.assets());
  }

  protected mimeTypeLabel(asset: AssetRecord): string {
    return getAssetMimeTypeLabel(asset);
  }
}
