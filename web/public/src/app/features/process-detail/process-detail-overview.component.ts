import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PublicProcessVersionView } from '../../core/models/public-portal.models';
import {
  getArchitectureLabel,
  getArchitectureSubtitle,
} from '../../core/ui/architecture-view.helpers';

@Component({
  selector: 'app-process-detail-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './process-detail-overview.component.html',
  styleUrl: './process-detail-overview.component.scss',
})
export class ProcessDetailOverviewComponent {
  version = input<PublicProcessVersionView | null>(null);
  emptyMessage = input.required<string>();

  protected readonly getArchitectureLabel = getArchitectureLabel;
  protected readonly getArchitectureSubtitle = getArchitectureSubtitle;
}
