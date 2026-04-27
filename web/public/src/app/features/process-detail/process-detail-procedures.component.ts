import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PublicProcessVersionView } from '../../core/models/public-portal.models';
import { ViewSelection } from './process-detail.page.helpers';

@Component({
  selector: 'app-process-detail-procedures',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './process-detail-procedures.component.html',
  styleUrl: './process-detail-procedures.component.scss',
})
export class ProcessDetailProceduresComponent {
  version = input.required<PublicProcessVersionView>();
  viewId = input.required<ViewSelection>();
}
