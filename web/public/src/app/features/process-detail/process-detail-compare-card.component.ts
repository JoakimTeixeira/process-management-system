import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PublicProcessVersionView } from '../../core/models/public-portal.models';
import { BpmnViewerComponent } from '../../shared/bpmn/bpmn-viewer.component';

@Component({
  selector: 'app-process-detail-compare-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, BpmnViewerComponent],
  templateUrl: './process-detail-compare-card.component.html',
  styleUrl: './process-detail-compare-card.component.scss',
})
export class ProcessDetailCompareCardComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
  version = input<PublicProcessVersionView | null>(null);
  processVersionId = input<string | null>(null);
}
