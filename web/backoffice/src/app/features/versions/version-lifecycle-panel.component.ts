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
  template: `
    <div class="detail-frame__body">
      <div class="work-layout">
        <div class="work-main">
          <mat-card appearance="outlined">
            <mat-card-content>
              <div class="work-card-header">
                <h3 class="work-card-title">{{ panelTitle() }}</h3>
                <p class="work-card-copy">{{ panelDescription() }}</p>
              </div>

              @if (canEditDraft()) {
                <form
                  class="work-form"
                  [formGroup]="draftForm()"
                  (ngSubmit)="saveDraftRequested.emit()"
                >
                  <mat-form-field appearance="outline">
                    <mat-label>Architecture state</mat-label>
                    <mat-select formControlName="architectureState" #architectureStateInput>
                      <mat-option value="AS-IS">AS-IS</mat-option>
                      <mat-option value="TO-BE">TO-BE</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Title</mat-label>
                    <input matInput formControlName="title" #titleInput />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Derived from version</mat-label>
                    <mat-select formControlName="derivedFromVersionId">
                      <mat-option value="">None</mat-option>
                      @for (relatedVersion of relatedVersions(); track relatedVersion.id) {
                        @if (relatedVersion.id !== version().id) {
                          <mat-option [value]="relatedVersion.id">
                            v{{ relatedVersion.versionNumber }} - {{ relatedVersion.title }}
                          </mat-option>
                        }
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Change description</mat-label>
                    <textarea
                      matInput
                      rows="5"
                      formControlName="changeDescription"
                      #changeDescriptionInput
                    ></textarea>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Reason for change</mat-label>
                    <textarea
                      matInput
                      rows="5"
                      formControlName="reasonForChange"
                      #reasonForChangeInput
                    ></textarea>
                  </mat-form-field>

                  @if (draftErrorMessage(); as draftErrorMessage) {
                    <p class="error-message">{{ draftErrorMessage }}</p>
                  }

                  <div class="card-actions">
                    <button
                      mat-flat-button
                      color="primary"
                      type="submit"
                      [disabled]="isSavingDraft()"
                    >
                      <mat-icon>save</mat-icon>
                      Save draft changes
                    </button>
                  </div>
                </form>
              } @else {
                <div class="work-context">
                  @if (process(); as process) {
                    <div class="work-context__item">
                      <span class="work-context__eyebrow">Process</span>
                      <p>
                        <strong>{{ process.code }} - {{ process.title }}</strong>
                      </p>
                      <p class="muted">
                        {{ process.teamName }} team - Owner {{ process.ownerName }}
                      </p>
                    </div>
                  }

                  <div class="work-context__item">
                    <span class="work-context__eyebrow">Change description</span>
                    <p>{{ version().changeDescription || 'No change description provided.' }}</p>
                  </div>

                  <div class="work-context__item">
                    <span class="work-context__eyebrow">Reason for change</span>
                    <p>{{ version().reasonForChange || 'No reason for change provided.' }}</p>
                  </div>

                  <div class="work-context__item">
                    <span class="work-context__eyebrow">Version lineage</span>
                    <p>
                      @if (derivedFromVersionLabel(); as derivedFromVersionLabel) {
                        Derived from {{ derivedFromVersionLabel }}
                      } @else {
                        This version is not linked to an earlier version.
                      }
                    </p>
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <aside class="work-sidebar">
          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-card-title>Your responsibility</mat-card-title>
            </mat-card-header>
            <mat-card-content class="work-sidebar-summary">
              <div class="work-sidebar-item">
                <span class="work-sidebar-label">Current state</span>
                <mat-chip-set>
                  <mat-chip>{{ version().lifecycleState }}</mat-chip>
                  <mat-chip>{{ version().architectureState }}</mat-chip>
                </mat-chip-set>
              </div>

              <div class="work-sidebar-item">
                <span class="work-sidebar-label">Waiting for role</span>
                <p>{{ waitingForRoleLabel() }}</p>
                @if (isWaitingForCurrentUser()) {
                  <div class="work-status-badge">
                    <mat-chip highlighted>Waiting for you</mat-chip>
                  </div>
                }
              </div>

              <div class="work-sidebar-item">
                <span class="work-sidebar-label">Next action</span>
                @if (nextChecklistLabel(); as nextChecklistLabel) {
                  <p>{{ nextChecklistLabel }}</p>
                  <button type="button" (click)="nextChecklistRequested.emit()" class="action-link">
                    Go to step
                  </button>
                } @else {
                  <p>{{ nextChecklistCompleteLabel() }}</p>
                }
              </div>
            </mat-card-content>
          </mat-card>

          @if (canShowChecklist()) {
            <mat-card appearance="outlined">
              <mat-card-header>
                <mat-card-title>{{ checklistTitle() }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                @if (canEditDraft()) {
                  <div class="work-sidebar-checklist">
                    <mat-checkbox [checked]="submissionRequirements().titlePresent" disabled
                      >Title is present</mat-checkbox
                    >
                    <mat-checkbox
                      [checked]="submissionRequirements().changeDescriptionPresent"
                      disabled
                      >Change description is present</mat-checkbox
                    >
                    <mat-checkbox
                      [checked]="submissionRequirements().reasonForChangePresent"
                      disabled
                      >Reason for change is present</mat-checkbox
                    >
                    <mat-checkbox
                      [checked]="submissionRequirements().architectureStateSelected"
                      disabled
                      >Architecture state is selected</mat-checkbox
                    >
                    <mat-checkbox [checked]="submissionRequirements().hasBpmnAsset" disabled
                      >BPMN diagram is uploaded</mat-checkbox
                    >
                    <mat-checkbox [checked]="submissionRequirements().hasProcedure" disabled
                      >At least 1 procedure is documented</mat-checkbox
                    >
                  </div>
                } @else if (showReviewChecklist()) {
                  <form [formGroup]="checklistForm()" class="work-sidebar-checklist">
                    <mat-checkbox formControlName="titleChecked">Title is correct</mat-checkbox>
                    <mat-checkbox formControlName="changeChecked"
                      >Change description is correct</mat-checkbox
                    >
                    <mat-checkbox formControlName="requirementsChecked"
                      >Reason for change is correct</mat-checkbox
                    >
                    <mat-checkbox formControlName="architectureChecked"
                      >Architecture state is correct</mat-checkbox
                    >
                    <mat-checkbox formControlName="diagramProceduresChecked"
                      >BPMN diagram reflects the documented procedures</mat-checkbox
                    >
                  </form>
                }
                <div class="checklist-progress">
                  <p class="muted">Checklist progress: {{ submissionReadinessLabel() }}</p>
                </div>
              </mat-card-content>
            </mat-card>
          }

          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-card-title>Decision</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (visibleActions().length === 0) {
                <p class="muted">No actions are available for your role in this state.</p>
              } @else {
                <form class="work-action-form" [formGroup]="actionForm()">
                  <mat-form-field appearance="outline">
                    <mat-label>Justification</mat-label>
                    <textarea matInput rows="3" formControlName="reason"></textarea>
                  </mat-form-field>

                  @if (showPromoteTitleField()) {
                    <mat-form-field appearance="outline">
                      <mat-label>Promoted title (optional)</mat-label>
                      <input matInput formControlName="promotionTitle" />
                    </mat-form-field>
                  }

                  @if (actionErrorMessage(); as actionErrorMessage) {
                    <p class="error-message">{{ actionErrorMessage }}</p>
                  }

                  <div class="work-action-list">
                    @for (action of visibleActions(); track action.key) {
                      <button
                        mat-flat-button
                        color="primary"
                        type="button"
                        [disabled]="isActing()"
                        (click)="lifecycleActionRequested.emit(action)"
                      >
                        <mat-icon>{{ action.icon }}</mat-icon>
                        {{ action.label }}
                      </button>
                    }
                  </div>
                </form>
              }
            </mat-card-content>
          </mat-card>
        </aside>
      </div>
    </div>
  `,
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
