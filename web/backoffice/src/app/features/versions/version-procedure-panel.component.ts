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
  template: `
    <div class="detail-frame__body">
      <mat-card appearance="outlined">
        <mat-card-content>
          @if (canEditDraft()) {
            <div class="procedure-form-shell">
              <div class="section-header">
                <div>
                  <h3 class="work-card-title">{{ panelTitle() }}</h3>
                  <p class="work-card-copy">
                    {{
                      editingProcedure()
                        ? 'Update the draft procedure details for this version.'
                        : 'Add draft procedures for this version. Codes are generated automatically.'
                    }}
                  </p>
                </div>
              </div>

              <form
                class="work-form"
                [formGroup]="procedureForm()"
                (ngSubmit)="saveRequested.emit()"
              >
                <mat-form-field appearance="outline">
                  <mat-label>Title</mat-label>
                  <input matInput formControlName="title" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Utility</mat-label>
                  <textarea matInput rows="3" formControlName="utility"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Warranty</mat-label>
                  <textarea matInput rows="3" formControlName="warranty"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Outcome</mat-label>
                  <textarea matInput rows="3" formControlName="outcome"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Policy</mat-label>
                  <textarea matInput rows="3" formControlName="policy"></textarea>
                </mat-form-field>

                <div class="procedure-activity-list">
                  <div class="section-header">
                    <div>
                      <strong>Activities</strong>
                      <p class="muted">Capture each step, resource, and work instruction.</p>
                    </div>
                    <button mat-button type="button" (click)="activityAdded.emit()">
                      <mat-icon>add</mat-icon>
                      Add activity
                    </button>
                  </div>

                  @if (activities().touched && activities().hasError('minItems')) {
                    <p class="error-message">Add at least one activity.</p>
                  }

                  @if (activities().length === 0) {
                    <p class="muted">No activities added yet.</p>
                  } @else {
                    <div formArrayName="activities" class="procedure-activity-list">
                      @for (activityGroup of activities().controls; track $index) {
                        <div class="procedure-activity-card" [formGroupName]="$index">
                          <div class="section-header">
                            <strong>Activity {{ $index + 1 }}</strong>
                            <button mat-button type="button" (click)="activityRemoved.emit($index)">
                              <mat-icon>delete</mat-icon>
                              Remove
                            </button>
                          </div>

                          <mat-form-field appearance="outline">
                            <mat-label>Service action</mat-label>
                            <input matInput formControlName="serviceAction" />
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Resource</mat-label>
                            <input matInput formControlName="resource" />
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Work instruction</mat-label>
                            <textarea
                              matInput
                              rows="3"
                              formControlName="workInstruction"
                            ></textarea>
                          </mat-form-field>
                        </div>
                      }
                    </div>
                  }
                </div>

                <mat-form-field appearance="outline">
                  <mat-label>Inputs</mat-label>
                  <textarea matInput rows="4" formControlName="inputsText"></textarea>
                  <mat-hint>Enter one input per line.</mat-hint>
                  @if (
                    procedureForm().controls['inputsText'].touched &&
                    procedureForm().controls['inputsText'].hasError('requiredList')
                  ) {
                    <mat-error>Add at least one input.</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Outputs</mat-label>
                  <textarea matInput rows="4" formControlName="outputsText"></textarea>
                  <mat-hint>Enter one output per line.</mat-hint>
                  @if (
                    procedureForm().controls['outputsText'].touched &&
                    procedureForm().controls['outputsText'].hasError('requiredList')
                  ) {
                    <mat-error>Add at least one output.</mat-error>
                  }
                </mat-form-field>

                @if (errorMessage(); as errorMessage) {
                  <p class="error-message">{{ errorMessage }}</p>
                }

                <div class="card-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="isSaving()">
                    <mat-icon>save</mat-icon>
                    {{ submitLabel() }}
                  </button>
                  @if (editingProcedure()) {
                    <button mat-button type="button" (click)="editCancelled.emit()">
                      <mat-icon>close</mat-icon>
                      Cancel
                    </button>
                  }
                </div>
              </form>
            </div>

            <mat-divider style="margin: 1rem 0;"></mat-divider>
          }

          @if (procedures().length === 0) {
            <p class="muted">No procedures defined for this version yet.</p>
          } @else {
            <div class="history-list">
              @for (procedure of procedures(); track procedure.id; let last = $last) {
                <div
                  [style]="
                    last
                      ? 'padding: 1rem 0;'
                      : 'padding: 1rem 0; border-bottom: 1px solid var(--portal-border);'
                  "
                >
                  <div class="section-header">
                    <div>
                      <strong>{{ procedure.code }} - {{ procedure.title }}</strong>
                      @if (procedure.utility) {
                        <p class="muted"><strong>Utility:</strong> {{ procedure.utility }}</p>
                      }
                      @if (procedure.warranty) {
                        <p class="muted"><strong>Warranty:</strong> {{ procedure.warranty }}</p>
                      }
                      @if (procedure.outcome) {
                        <p class="muted"><strong>Outcome:</strong> {{ procedure.outcome }}</p>
                      }
                      @if (procedure.policy) {
                        <p class="muted"><strong>Policy:</strong> {{ procedure.policy }}</p>
                      }
                      @if (procedure.activities && procedure.activities.length > 0) {
                        <div class="muted" style="margin-top: 0.75rem;">
                          <strong>Activities ({{ procedure.activities.length }}):</strong>
                          <ul style="margin: 0.5rem 0 0 1.5rem; padding: 0;">
                            @for (activity of procedure.activities; track $index) {
                              <li style="margin-bottom: 0.5rem;">
                                {{
                                  activity['service_action'] ||
                                    activity['Service Action'] ||
                                    'Activity'
                                }}
                                <ul style="margin: 0.25rem 0 0 1.25rem; padding: 0;">
                                  @if (activity['resource'] || activity['Resource']) {
                                    <li style="margin-bottom: 0.25rem;">
                                      Resource: {{ activity['resource'] || activity['Resource'] }}
                                    </li>
                                  }
                                  @if (
                                    activity['work_instruction'] || activity['Work Instruction']
                                  ) {
                                    <li>
                                      {{
                                        activity['work_instruction'] || activity['Work Instruction']
                                      }}
                                    </li>
                                  }
                                </ul>
                              </li>
                            }
                          </ul>
                        </div>
                      }
                      @if (procedure.inputs && procedure.inputs.length > 0) {
                        <div class="muted" style="margin-top: 0.75rem;">
                          <strong>Inputs ({{ procedure.inputs.length }}):</strong>
                          <ul style="margin: 0.5rem 0 0 1.5rem; padding: 0;">
                            @for (procedureInput of procedure.inputs; track $index) {
                              <li style="margin-bottom: 0.25rem;">
                                {{
                                  typeof procedureInput === 'string'
                                    ? procedureInput
                                    : (procedureInput | json)
                                }}
                              </li>
                            }
                          </ul>
                        </div>
                      }
                      @if (procedure.outputs && procedure.outputs.length > 0) {
                        <div class="muted" style="margin-top: 0.75rem;">
                          <strong>Outputs ({{ procedure.outputs.length }}):</strong>
                          <ul style="margin: 0.5rem 0 0 1.5rem; padding: 0;">
                            @for (procedureOutput of procedure.outputs; track $index) {
                              <li style="margin-bottom: 0.25rem;">
                                {{
                                  typeof procedureOutput === 'string'
                                    ? procedureOutput
                                    : (procedureOutput | json)
                                }}
                              </li>
                            }
                          </ul>
                        </div>
                      }
                    </div>
                    @if (canEditDraft()) {
                      <div class="card-actions">
                        <button mat-button type="button" (click)="editRequested.emit(procedure)">
                          <mat-icon>edit</mat-icon>
                          Edit
                        </button>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
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
