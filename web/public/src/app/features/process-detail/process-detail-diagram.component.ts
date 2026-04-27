import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PublicProcessVersionView } from '../../core/models/public-portal.models';
import { getArchitectureLabel } from '../../core/ui/architecture-view.helpers';
import { BpmnViewerComponent } from '../../shared/bpmn/bpmn-viewer.component';

@Component({
  selector: 'app-process-detail-diagram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, BpmnViewerComponent],
  templateUrl: './process-detail-diagram.component.html',
  styleUrl: './process-detail-diagram.component.scss',
})
export class ProcessDetailDiagramComponent {
  version = input<PublicProcessVersionView | null>(null);
  emptyMessage = input.required<string>();

  protected readonly getArchitectureLabel = getArchitectureLabel;
}
