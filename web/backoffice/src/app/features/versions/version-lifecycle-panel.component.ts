import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';

import { LifecycleActionDefinition } from '../../core/governance/version-governance';
import { ProcessRecord, ProcessVersionRecord } from '../../core/models/backoffice.models';

export interface SubmissionRequirements {
  titlePresent: boolean;
  changeDescriptionPresent: boolean;
  reasonForChangePresent: boolean;
  architectureStateSelected: boolean;
  hasBpmnAsset: boolean;
  hasProcedure: boolean;
}

@Component({
  selector: 'app-version-lifecycle-panel',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './version-lifecycle-panel.component.html',
  styleUrl: './version-lifecycle-panel.component.scss',
})
export class VersionLifecyclePanelComponent {
  @ViewChild('titleInput', { static: false })
  private readonly titleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('changeDescriptionInput', { static: false })
  private readonly changeDescriptionInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('reasonForChangeInput', { static: false })
  private readonly reasonForChangeInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('architectureStateInput', { static: false })
  private readonly architectureStateInput?: MatSelect;

  readonly version = input.required<ProcessVersionRecord>();
  readonly process = input<ProcessRecord | null>(null);
  readonly relatedVersions = input.required<ProcessVersionRecord[]>();
  readonly draftForm = input.required<FormGroup>();
  readonly checklistForm = input.required<FormGroup>();
  readonly actionForm = input.required<FormGroup>();
  readonly panelTitle = input.required<string>();
  readonly panelDescription = input.required<string>();
  readonly canEditDraft = input.required<boolean>();
  readonly derivedFromVersionLabel = input<string | null>(null);
  readonly draftErrorMessage = input<string | null>(null);
  readonly isSavingDraft = input.required<boolean>();
  readonly waitingForRoleLabel = input.required<string>();
  readonly isWaitingForCurrentUser = input.required<boolean>();
  readonly nextChecklistLabel = input<string | null>(null);
  readonly nextChecklistCompleteLabel = input.required<string>();
  readonly canShowChecklist = input.required<boolean>();
  readonly checklistTitle = input.required<string>();
  readonly submissionRequirements = input.required<SubmissionRequirements>();
  readonly showReviewChecklist = input.required<boolean>();
  readonly submissionReadinessLabel = input.required<string>();
  readonly visibleActions = input.required<LifecycleActionDefinition[]>();
  readonly showPromoteTitleField = input.required<boolean>();
  readonly actionErrorMessage = input<string | null>(null);
  readonly isActing = input.required<boolean>();

  readonly saveDraftRequested = output<void>();
  readonly nextChecklistRequested = output<void>();
  readonly lifecycleActionRequested = output<LifecycleActionDefinition>();

  focusField(inputId: string): void {
    const focusTarget = this.getFocusTarget(inputId);
    focusTarget?.focus();
  }

  private getFocusTarget(inputId: string): { focus: () => void } | undefined {
    switch (inputId) {
      case 'title':
        return this.titleInput?.nativeElement;
      case 'changeDescription':
        return this.changeDescriptionInput?.nativeElement;
      case 'reasonForChange':
        return this.reasonForChangeInput?.nativeElement;
      case 'architectureState':
        return this.architectureStateInput;
      default:
        return undefined;
    }
  }
}
