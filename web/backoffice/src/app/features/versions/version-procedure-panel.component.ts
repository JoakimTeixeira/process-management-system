import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { ProcedureRecord } from '../../core/models/backoffice.models';

@Component({
  selector: 'app-version-procedure-panel',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './version-procedure-panel.component.html',
  styleUrl: './version-procedure-panel.component.scss',
})
export class VersionProcedurePanelComponent {
  readonly canEditDraft = input.required<boolean>();
  readonly panelTitle = input.required<string>();
  readonly editingProcedure = input.required<boolean>();
  readonly procedureForm = input.required<FormGroup>();
  readonly activities = input.required<FormArray>();
  readonly errorMessage = input<string | null>(null);
  readonly isSaving = input.required<boolean>();
  readonly submitLabel = input.required<string>();
  readonly procedures = input.required<ProcedureRecord[]>();

  readonly activityAdded = output<void>();
  readonly activityRemoved = output<number>();
  readonly saveRequested = output<void>();
  readonly editCancelled = output<void>();
  readonly editRequested = output<ProcedureRecord>();
}
