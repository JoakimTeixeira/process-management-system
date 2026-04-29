import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelect, MatSelectModule } from '@angular/material/select';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AccessControlUtil } from '../../core/governance/access-control.util';
import { AuthService } from '../../core/auth/auth.service';
import {
  canAccessGovernanceHistory,
  getVisibleLifecycleActions,
  LifecycleActionDefinition,
} from '../../core/governance/version-governance';
import { getHttpErrorMessage } from '../../core/http/http-error-message';
import { BreadcrumbService } from '../../core/navigation/breadcrumb.service';
import { ToastService } from '../../core/toast/toast.service';
import { ConfirmDeleteDialogComponent } from '../../shared/confirm-delete-dialog.component';
import {
  AssetContentRecord,
  AssetRecord,
  AuditLogRecord,
  ProcedureRecord,
  ProcessRecord,
  ProcessVersionRecord,
  VersionStateHistoryRecord,
} from '../../core/models/backoffice.models';
import { BackofficeBpmnViewerComponent } from '../../shared/bpmn/backoffice-bpmn-viewer.component';

type VersionDetailTabId =
  | 'summary'
  | 'work'
  | 'diagram'
  | 'procedures'
  | 'history';

interface ProcedureActivityFormValue {
  resource: string;
  serviceAction: string;
  workInstruction: string;
}

function nonEmptyLineListValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = control.value ?? '';
    const entries = value
      .split('\n')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);

    return entries.length > 0 ? null : { requiredList: true };
  };
}

function minItemsValidator(minItems: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const length = Array.isArray(value) ? value.length : 0;

    return length >= minItems
      ? null
      : { minItems: { required: minItems, actual: length } };
  };
}

@Component({
  selector: 'app-version-detail-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    BackofficeBpmnViewerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }

      .page {
        max-width: 80rem;
      }

      .content-grid {
        grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
      }

      .wide-card {
        grid-column: 1 / -1;
      }

      .history-card {
        overflow: hidden;
      }

      mat-card {
        background-color: #ffffff;
      }

      .detail-frame {
        border: 1px solid var(--portal-border);
        border-radius: var(--surface-radius);
        background: var(--portal-surface);
        box-shadow: var(--shadow-sm);
      }

      .detail-frame__tabs {
        display: flex;
        flex-direction: column;
      }

      .detail-tab-shell {
        border-bottom: 1px solid var(--portal-border);
        background: var(--portal-surface-alt);
      }

      .detail-tab-shell__inner {
        display: flex;
        overflow-x: auto;
        padding: 0 1rem;
      }

      .detail-tab-nav {
        display: flex;
        gap: 0.25rem;
      }

      .detail-tab-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border: none;
        background: transparent;
        color: var(--portal-ink);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .detail-tab-button:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      .detail-tab-button--active {
        color: var(--portal-blue);
        border-bottom-color: var(--portal-blue);
        background: rgba(21, 101, 192, 0.08);
      }

      .detail-frame__body {
        padding: 1.5rem;
      }

      .diagram-workspace {
        display: grid;
        gap: 1rem;
      }

      .version-header-card,
      .summary-card {
        border: 1px solid var(--portal-border);
        border-radius: var(--surface-radius);
        background: #ffffff;
      }

      .version-header-meta,
      .summary-grid {
        display: grid;
        gap: 1rem;
      }

      .summary-grid {
        grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
      }

      .summary-stat {
        padding: 1rem;
        border: 1px solid var(--portal-border);
        border-radius: calc(var(--surface-radius) * 0.9);
        background: var(--portal-surface-alt);
      }

      .summary-stat__label {
        display: block;
        margin-bottom: 0.35rem;
        color: var(--portal-muted);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .summary-stat p,
      .summary-stat strong {
        margin: 0;
      }

      .upload-shell {
        display: grid;
        gap: 1rem;
      }

      .upload-file-row {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        align-items: center;
      }

      .upload-file-input {
        display: none;
      }

      .diagram-viewer-panel,
      .diagram-revision-panel {
        border: 1px solid var(--portal-border);
        border-radius: var(--surface-radius);
        background: #ffffff;
        padding: 1rem;
      }

      .diagram-viewer-panel {
        display: none;
      }

      .diagram-preview-meta {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: flex-start;
        flex-wrap: wrap;
      }

      .diagram-chip-row {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .diagram-revision-card {
        border: 1px solid var(--portal-border);
        border-radius: calc(var(--surface-radius) * 0.9);
        background: #ffffff;
        padding: 1rem;
      }

      .diagram-revision-card--previewing {
        border-color: rgba(15, 108, 189, 0.35);
        box-shadow: 0 0 0 1px rgba(15, 108, 189, 0.12);
      }

      .diagram-preview-block {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--portal-border);
      }

      .diagram-revision-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 0.75rem;
      }

      .diagram-xml-block {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--portal-border);
      }

      .work-layout {
        display: grid;
        grid-template-columns: minmax(0, 2.3fr) minmax(18rem, 1fr);
        gap: 1.5rem;
        align-items: stretch;
      }

      .work-main {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .work-main mat-card {
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      .work-main mat-card mat-card-content {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .work-sidebar {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: sticky;
        top: 1rem;
      }

      .work-sidebar mat-card {
        display: flex;
        flex-direction: column;
      }

      .work-sidebar mat-card mat-card-content {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .work-sidebar mat-card:nth-child(2) {
        flex: 1;
      }

      .work-card-header {
        margin-bottom: 2.5rem;
      }

      .work-card-title {
        margin: 0 0 0.5rem;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .work-card-copy {
        margin: 0.25rem 0 0;
        color: var(--portal-muted);
      }

      .work-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        flex: 1;
      }

      .work-form mat-form-field {
        width: 100%;
      }

      .work-form .card-actions {
        margin-top: auto;
      }

      .procedure-form-shell {
        display: grid;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .procedure-activity-list {
        display: grid;
        gap: 0.75rem;
      }

      .procedure-activity-card {
        padding: 1rem;
        border: 1px solid var(--portal-border);
        border-radius: 0.875rem;
        background: var(--portal-surface-alt);
      }

      .work-context {
        display: grid;
        gap: 1rem;
      }

      .work-context__item {
        padding: 1rem;
        border: 1px solid var(--portal-border);
        border-radius: 0.875rem;
        background: var(--portal-surface-alt);
      }

      .work-context__eyebrow,
      .work-sidebar-label {
        display: block;
        margin-bottom: 0.35rem;
        color: var(--portal-muted);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .work-context__item p,
      .work-sidebar-item p {
        margin: 0;
      }

      .work-sidebar-summary {
        display: grid;
        gap: 1rem;
      }

      .work-sidebar-item {
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--portal-border);
      }

      .work-sidebar-item:last-child {
        padding-bottom: 0;
        border-bottom: none;
      }

      .work-status-badge {
        margin-top: 0.5rem;
      }

      .action-link {
        background: none;
        border: none;
        color: var(--portal-primary);
        cursor: pointer;
        padding: 0;
        font-size: inherit;
        text-decoration: underline;
        display: inline;
        margin: 0.25rem 0;
      }

      .action-link:hover {
        color: var(--portal-primary-dark);
      }

      .card-actions {
        display: flex;
        gap: 0.75rem;
      }

      .work-action-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        flex: 1;
      }

      .work-action-form mat-form-field {
        width: 100%;
      }

      .work-action-form .work-action-list {
        margin-top: auto;
      }

      .work-action-list {
        display: flex;
        gap: 0.75rem;
      }

      .work-action-list button {
        justify-content: flex-start;
      }

      @media (max-width: 960px) {
        .upload-file-row {
          align-items: stretch;
          flex-direction: column;
        }

        .diagram-preview-meta {
          flex-direction: column;
        }

        .work-layout {
          grid-template-columns: 1fr;
        }

        .work-sidebar {
          position: static;
        }
      }
    `,
  ],
  template: `
    <section class="page">
      @if (isLoading()) {
        <section class="center-state bo-state-card">
          <mat-progress-spinner mode="indeterminate" />
        </section>
      } @else if (errorMessage(); as errorMessage) {
        <mat-card appearance="outlined">
          <mat-card-content>{{ errorMessage }}</mat-card-content>
        </mat-card>
      } @else if (version(); as version) {
        <section class="bo-page-intro">
          <div class="bo-page-intro__copy">
            <h1>{{ headerTitle() }}</h1>
            <p class="muted">{{ headerSubtitle() }}</p>
            <mat-chip-set>
              <mat-chip>v{{ version.versionNumber }}</mat-chip>
              <mat-chip>{{ version.lifecycleState }}</mat-chip>
              <mat-chip>{{ version.architectureState }}</mat-chip>
              <mat-chip>{{ submissionReadinessLabel() }}</mat-chip>
              <mat-chip>{{ summaryDiagramStatus() }}</mat-chip>
            </mat-chip-set>
          </div>
        </section>

        <section class="detail-frame">
          <section class="detail-frame__tabs">
            <div class="detail-tab-shell">
              <div class="detail-tab-shell__inner">
                <nav class="detail-tab-nav" aria-label="Version sections">
                  @for (tab of tabs(); track tab.id) {
                    <button
                      type="button"
                      class="detail-tab-button"
                      [class.detail-tab-button--active]="selectedTab() === tab.id"
                      (click)="selectTab(tab.id)"
                      [attr.aria-current]="selectedTab() === tab.id ? 'page' : null"
                    >
                      <span class="detail-tab-button__label">{{ tab.label }}</span>
                    </button>
                  }
                </nav>
              </div>
            </div>

            @if (selectedTab() === 'summary') {
              <div class="detail-frame__body">
                <mat-card appearance="outlined" class="version-header-card" style="margin-bottom: 1rem;">
                  <mat-card-content class="version-header-meta">
                    @if (process(); as process) {
                      <div>
                        <p class="work-sidebar-label">Process</p>
                        <h3 class="work-card-title">{{ process.code }} - {{ process.title }}</h3>
                        <p class="muted">{{ process.teamName }} team - Owner {{ process.ownerName }}</p>
                      </div>
                    }
                    <mat-chip-set>
                      <mat-chip>v{{ version.versionNumber }}</mat-chip>
                      <mat-chip>{{ version.lifecycleState }}</mat-chip>
                      <mat-chip>{{ version.architectureState }}</mat-chip>
                      <mat-chip>Waiting for {{ waitingForRoleLabel() }}</mat-chip>
                    </mat-chip-set>
                  </mat-card-content>
                </mat-card>

                <div class="summary-grid" style="margin-bottom: 1rem;">
                  <section class="summary-stat">
                    <span class="summary-stat__label">Lineage</span>
                    <strong>
                      @if (derivedFromVersionLabel(); as derivedFromVersionLabel) {
                        {{ derivedFromVersionLabel }}
                      } @else {
                        No earlier linked version
                      }
                    </strong>
                  </section>
                  <section class="summary-stat">
                    <span class="summary-stat__label">Readiness</span>
                    <strong>{{ submissionReadinessLabel() }}</strong>
                    <p class="muted">Metadata, BPMN, procedures, and review status are tracked live.</p>
                  </section>
                  <section class="summary-stat">
                    <span class="summary-stat__label">Diagram</span>
                    <strong>{{ summaryDiagramStatus() }}</strong>
                    <p class="muted">{{ assets().length }} uploaded revision(s)</p>
                  </section>
                  <section class="summary-stat">
                    <span class="summary-stat__label">Procedures</span>
                    <strong>{{ procedures().length }} procedure(s)</strong>
                    <p class="muted">{{ hasProcedure() ? 'Procedure set is present' : 'No procedures added yet' }}</p>
                  </section>
                </div>

                <mat-card appearance="outlined" class="summary-card">
                  <mat-card-content>
                    <div class="work-context">
                      <div class="work-context__item">
                        <span class="work-context__eyebrow">Change description</span>
                        <p>{{ version.changeDescription || 'No change description provided.' }}</p>
                      </div>
                      <div class="work-context__item">
                        <span class="work-context__eyebrow">Reason for change</span>
                        <p>{{ version.reasonForChange || 'No reason for change provided.' }}</p>
                      </div>
                      <div class="work-context__item">
                        <span class="work-context__eyebrow">Governance summary</span>
                        <p>{{ governanceSummaryText() }}</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            } @else if (selectedTab() === 'work') {
              <div class="detail-frame__body">
                <div class="work-layout">
                  <div class="work-main">
                    <mat-card appearance="outlined">
                      <mat-card-content>
                        <div class="work-card-header">
                          <h3 class="work-card-title">{{ workPanelTitle() }}</h3>
                          <p class="work-card-copy">{{ workPanelDescription() }}</p>
                        </div>

                        @if (canEditDraft()) {
                          <form class="work-form" [formGroup]="draftForm" (ngSubmit)="saveDraft()">
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
                                  @if (relatedVersion.id !== version.id) {
                                    <mat-option [value]="relatedVersion.id">
                                      v{{ relatedVersion.versionNumber }} - {{ relatedVersion.title }}
                                    </mat-option>
                                  }
                                }
                              </mat-select>
                            </mat-form-field>

                            <mat-form-field appearance="outline">
                              <mat-label>Change description</mat-label>
                              <textarea matInput rows="5" formControlName="changeDescription" #changeDescriptionInput></textarea>
                            </mat-form-field>

                            <mat-form-field appearance="outline">
                              <mat-label>Reason for change</mat-label>
                              <textarea matInput rows="5" formControlName="reasonForChange" #reasonForChangeInput></textarea>
                            </mat-form-field>

                            @if (draftErrorMessage(); as draftErrorMessage) {
                              <p class="error-message">{{ draftErrorMessage }}</p>
                            }

                            <div class="card-actions">
                              <button mat-flat-button color="primary" type="submit" [disabled]="isSavingDraft()">
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
                                <p><strong>{{ process.code }} - {{ process.title }}</strong></p>
                                <p class="muted">{{ process.teamName }} team - Owner {{ process.ownerName }}</p>
                              </div>
                            }

                            <div class="work-context__item">
                              <span class="work-context__eyebrow">Change description</span>
                              <p>{{ version.changeDescription || 'No change description provided.' }}</p>
                            </div>

                            <div class="work-context__item">
                              <span class="work-context__eyebrow">Reason for change</span>
                              <p>{{ version.reasonForChange || 'No reason for change provided.' }}</p>
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
                            <mat-chip>{{ version.lifecycleState }}</mat-chip>
                            <mat-chip>{{ version.architectureState }}</mat-chip>
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
                          @if (nextChecklistItem(); as nextItem) {
                            <p>{{ nextItem.label }}</p>
                            <button type="button" (click)="executeNextChecklistAction()" class="action-link">Go to step</button>
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
                            <div class="work-sidebar-summary">
                              <mat-checkbox [checked]="submissionRequirements().titlePresent" disabled>
                                Title is present
                              </mat-checkbox>
                              <mat-checkbox [checked]="submissionRequirements().changeDescriptionPresent" disabled>
                                Change description is present
                              </mat-checkbox>
                              <mat-checkbox [checked]="submissionRequirements().reasonForChangePresent" disabled>
                                Reason for change is present
                              </mat-checkbox>
                              <mat-checkbox [checked]="submissionRequirements().architectureStateSelected" disabled>
                                Architecture state is selected
                              </mat-checkbox>
                              <mat-checkbox [checked]="submissionRequirements().hasBpmnAsset" disabled>
                                BPMN diagram is uploaded
                              </mat-checkbox>
                              <mat-checkbox [checked]="submissionRequirements().hasProcedure" disabled>
                                At least 1 procedure is documented
                              </mat-checkbox>
                            </div>
                          } @else if (showReviewChecklist()) {
                            <form [formGroup]="checklistForm">
                              <mat-checkbox formControlName="titleChecked">
                                Title is correct
                              </mat-checkbox>
                              <mat-checkbox formControlName="changeChecked">
                                Change description is correct
                              </mat-checkbox>
                              <mat-checkbox formControlName="requirementsChecked">
                                Reason for change is correct
                              </mat-checkbox>
                              <mat-checkbox formControlName="architectureChecked">
                                Architecture state is correct
                              </mat-checkbox>
                              <mat-checkbox formControlName="diagramProceduresChecked">
                                BPMN diagram reflects the documented procedures
                              </mat-checkbox>
                            </form>
                          }
                          <div class="checklist-progress">
                            <p class="muted">
                              Checklist progress: {{ submissionReadinessLabel() }}
                            </p>
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
                          <form class="work-action-form" [formGroup]="actionForm">
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
                                  (click)="runLifecycleAction(action)"
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
            } @else if (selectedTab() === 'diagram') {
              <div class="detail-frame__body">
                <mat-card appearance="outlined">
                  <mat-card-content>
                    @if (canUploadBpmn()) {
                      <form class="upload-shell" [formGroup]="uploadForm" (ngSubmit)="uploadAsset()">
                        <mat-form-field appearance="outline">
                          <mat-label>Asset Caption</mat-label>
                          <input matInput formControlName="caption" />
                        </mat-form-field>

                        <input
                          #bpmnFileInput
                          class="upload-file-input"
                          type="file"
                          accept=".bpmn,.xml,text/xml,application/xml"
                          (change)="onFileSelected($event)"
                        />

                        <div class="upload-file-row">
                          <button mat-stroked-button type="button" (click)="bpmnFileInput.click()">
                            <mat-icon>attach_file</mat-icon>
                            Upload file
                          </button>
                          <button mat-flat-button color="primary" type="submit" [disabled]="isUploading()">
                            <mat-icon>upload_file</mat-icon>
                            {{ uploadSubmitLabel() }}
                          </button>
                        </div>

                        @if (selectedFileName(); as selectedFileName) {
                          <p class="muted">Selected file: {{ selectedFileName }}</p>
                        }

                        @if (uploadErrorMessage(); as uploadErrorMessage) {
                          <p class="error-message">{{ uploadErrorMessage }}</p>
                        }

                      </form>

                      <mat-divider style="margin: 1rem 0;"></mat-divider>
                    }

                    @if (currentAssets().length === 0) {
                      <p class="muted">No BPMN assets uploaded yet.</p>
                    } @else {
                      <div class="diagram-workspace">
                        <section class="diagram-viewer-panel">
                          @if (previewAsset(); as previewAsset) {
                            <div class="diagram-preview-meta">
                              <div>
                                <p class="work-sidebar-label">Current preview</p>
                                <h3 class="work-card-title">{{ previewAsset.caption }}</h3>
                                <p class="muted">
                                  Process version v{{ version.versionNumber }} - Diagram revision
                                  {{ getAssetRevisionLabel(previewAsset) }} - Uploaded
                                  {{ previewAsset.createdAt | date: 'medium' }}
                                </p>
                                @if (previewAsset.supersededAt) {
                                  <p class="muted">
                                    Superseded: {{ previewAsset.supersededAt | date: 'medium' }}
                                  </p>
                                }
                              </div>
                              <div class="diagram-chip-row">
                                <mat-chip>{{ getAssetRevisionLabel(previewAsset) }}</mat-chip>
                                <mat-chip>{{
                                  previewAsset.isCurrent
                                    ? 'Current revision'
                                    : 'Superseded revision'
                                }}</mat-chip>
                              </div>
                            </div>
                          }

                          <app-backoffice-bpmn-viewer
                            [xml]="diagramPreviewXml()"
                            [title]="diagramPreviewTitle()"
                            [subtitle]="diagramPreviewSubtitle()"
                            emptyMessage="Select a BPMN asset to visualise."
                          />
                        </section>

                        <section class="diagram-revision-panel">
                          <div class="work-card-header">
                            <h3 class="work-card-title">Diagram revisions</h3>
                            <p class="work-card-copy">
                              The current revision starts expanded. Open another preview to switch
                              the active diagram while keeping XML available inline.
                            </p>
                          </div>

                          <div class="history-list">
                            @for (asset of assetTimeline(); track asset.id) {
                              <div
                                class="diagram-revision-card"
                                [class.diagram-revision-card--previewing]="isPreviewedAsset(asset)"
                              >
                                <div class="section-header">
                                  <div>
                                    <strong>{{ asset.caption }}</strong>
                                    <p class="muted">
                                      Process version v{{ version.versionNumber }} - Diagram revision
                                      {{ getAssetRevisionLabel(asset) }}
                                    </p>
                                    <p class="muted">
                                      Uploaded {{ asset.createdAt | date: 'medium' }} -
                                      {{ getAssetMimeTypeLabel(asset) }} - {{ asset.sizeBytes }} bytes
                                    </p>
                                    @if (asset.supersededAt) {
                                      <p class="muted">
                                        Superseded {{ asset.supersededAt | date: 'medium' }}
                                      </p>
                                    }
                                  </div>
                                  <div class="diagram-chip-row">
                                    <mat-chip>{{ getAssetRevisionLabel(asset) }}</mat-chip>
                                    <mat-chip>{{
                                      asset.isCurrent ? 'Current revision' : 'Superseded revision'
                                    }}</mat-chip>
                                  </div>
                                </div>

                                <div class="diagram-revision-actions">
                                  <button mat-button type="button" (click)="toggleAssetPreview(asset)">
                                    <mat-icon>preview</mat-icon>
                                    {{
                                      expandedPreviewAssetId() === asset.id
                                        ? 'Hide preview'
                                        : 'Preview'
                                    }}
                                  </button>
                                  <button mat-button type="button" (click)="toggleAssetXml(asset)">
                                    <mat-icon>code</mat-icon>
                                    {{
                                      expandedAssetXmlId() === asset.id ? 'Hide XML' : 'View XML'
                                    }}
                                  </button>
                                </div>

                                @if (
                                  expandedPreviewAssetId() === asset.id &&
                                  previewAssetContent()?.id === asset.id
                                ) {
                                  <div class="diagram-preview-block">
                                    <div class="diagram-preview-meta">
                                      <div>
                                        <p class="work-sidebar-label">Preview</p>
                                        <h4 style="margin: 0 0 0.35rem;">
                                          {{ asset.caption }} - {{ getAssetRevisionLabel(asset) }}
                                        </h4>
                                        <p class="muted">
                                          Process version v{{ version.versionNumber }} - Uploaded
                                          {{ asset.createdAt | date: 'medium' }}
                                        </p>
                                      </div>                                    </div>

                                    <app-backoffice-bpmn-viewer
                                      [xml]="previewAssetContent()?.content ?? null"
                                      [title]="asset.caption + ' (' + getAssetRevisionLabel(asset) + ')'"
                                      [subtitle]="'Process version v' + version.versionNumber + ' - Diagram preview'"
                                      emptyMessage="Select a BPMN asset to visualise."
                                    />
                                  </div>
                                }

                                @if (
                                  expandedAssetXmlId() === asset.id &&
                                  expandedAssetXmlContent()?.id === asset.id
                                ) {
                                  <div class="diagram-xml-block">
                                    <h4>{{ asset.caption }} XML</h4>
                                    <pre class="bo-xml-preview">{{ expandedAssetXmlContent()?.content }}</pre>
                                  </div>
                                }
                              </div>
                            }
                          </div>
                        </section>
                      </div>
                    }
                  </mat-card-content>
                </mat-card>
              </div>
            } @else if (selectedTab() === 'procedures') {
              <div class="detail-frame__body">
                <mat-card appearance="outlined">
                  <mat-card-content>
                    @if (canEditDraft()) {
                      <div class="procedure-form-shell">
                        <div class="section-header">
                          <div>
                            <h3 class="work-card-title">{{ procedurePanelTitle() }}</h3>
                            <p class="work-card-copy">
                              {{
                                editingProcedure()
                                  ? 'Update the draft procedure details for this version.'
                                  : 'Add draft procedures for this version. Codes are generated automatically.'
                              }}
                            </p>
                          </div>
                        </div>

                        <form class="work-form" [formGroup]="procedureForm" (ngSubmit)="saveProcedure()">
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
                              <button mat-button type="button" (click)="addProcedureActivity()">
                                <mat-icon>add</mat-icon>
                                Add activity
                              </button>
                            </div>

                            @if (
                              procedureActivities().touched &&
                              procedureActivities().hasError('minItems')
                            ) {
                              <p class="error-message">Add at least one activity.</p>
                            }

                            @if (procedureActivities().length === 0) {
                              <p class="muted">No activities added yet.</p>
                            } @else {
                              <div formArrayName="activities" class="procedure-activity-list">
                                @for (activityGroup of procedureActivities().controls; track $index) {
                                  <div class="procedure-activity-card" [formGroupName]="$index">
                                    <div class="section-header">
                                      <strong>Activity {{ $index + 1 }}</strong>
                                      <button
                                        mat-button
                                        type="button"
                                        (click)="removeProcedureActivity($index)"
                                      >
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
                            <textarea
                              matInput
                              rows="4"
                              formControlName="inputsText"
                            ></textarea>
                            <mat-hint>Enter one input per line.</mat-hint>
                            @if (
                              procedureForm.controls.inputsText.touched &&
                              procedureForm.controls.inputsText.hasError('requiredList')
                            ) {
                              <mat-error>Add at least one input.</mat-error>
                            }
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Outputs</mat-label>
                            <textarea
                              matInput
                              rows="4"
                              formControlName="outputsText"
                            ></textarea>
                            <mat-hint>Enter one output per line.</mat-hint>
                            @if (
                              procedureForm.controls.outputsText.touched &&
                              procedureForm.controls.outputsText.hasError('requiredList')
                            ) {
                              <mat-error>Add at least one output.</mat-error>
                            }
                          </mat-form-field>

                          @if (procedureErrorMessage(); as procedureErrorMessage) {
                            <p class="error-message">{{ procedureErrorMessage }}</p>
                          }

                          <div class="card-actions">
                            <button
                              mat-flat-button
                              color="primary"
                              type="submit"
                              [disabled]="isSavingProcedure()"
                            >
                              <mat-icon>save</mat-icon>
                              {{ procedureSubmitLabel() }}
                            </button>
                            @if (editingProcedure()) {
                              <button mat-button type="button" (click)="cancelProcedureEdit()">
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
                          <div [style]="last ? 'padding: 1rem 0;' : 'padding: 1rem 0; border-bottom: 1px solid var(--portal-border);'">
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
                                          {{ activity['service_action'] || activity['Service Action'] || 'Activity' }}
                                          <ul style="margin: 0.25rem 0 0 1.25rem; padding: 0;">
                                            @if (activity['resource'] || activity['Resource']) {
                                              <li style="margin-bottom: 0.25rem;">Resource: {{ activity['resource'] || activity['Resource'] }}</li>
                                            }
                                            @if (activity['work_instruction'] || activity['Work Instruction']) {
                                              <li>{{ activity['work_instruction'] || activity['Work Instruction'] }}</li>
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
                                      @for (input of procedure.inputs; track $index) {
                                        <li style="margin-bottom: 0.25rem;">{{ typeof input === 'string' ? input : (input | json) }}</li>
                                      }
                                    </ul>
                                  </div>
                                }
                                @if (procedure.outputs && procedure.outputs.length > 0) {
                                  <div class="muted" style="margin-top: 0.75rem;">
                                    <strong>Outputs ({{ procedure.outputs.length }}):</strong>
                                    <ul style="margin: 0.5rem 0 0 1.5rem; padding: 0;">
                                      @for (output of procedure.outputs; track $index) {
                                        <li style="margin-bottom: 0.25rem;">{{ typeof output === 'string' ? output : (output | json) }}</li>
                                      }
                                    </ul>
                                  </div>
                                }
                              </div>
                              @if (canEditDraft()) {
                                <div class="card-actions">
                                  <button mat-button type="button" (click)="startEditingProcedure(procedure)">
                                    <mat-icon>edit</mat-icon>
                                    Edit
                                  </button>
                                  <button
                                    mat-button
                                    type="button"
                                    (click)="confirmDeleteProcedure(procedure)"
                                    [disabled]="isDeletingProcedure()"
                                  >
                                    <mat-icon>delete</mat-icon>
                                    Delete
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
            } @else if (selectedTab() === 'history') {
              <div class="detail-frame__body">
                <mat-card appearance="outlined">
                  <mat-card-content>
                    <div class="work-card-header">
                      <h3 class="work-card-title">Change description</h3>
                      <p>{{ version.changeDescription }}</p>
                    </div>
                    <div class="work-card-header">
                      <h3 class="work-card-title">Reason for change</h3>
                      <p>{{ version.reasonForChange }}</p>
                    </div>

                    @if (historyAvailable()) {
                      <mat-divider style="margin: 2.5rem 0;"></mat-divider>

                      <div class="work-card-header">
                        <h3 class="work-card-title">Lifecycle history</h3>
                        @if (stateHistory().length === 0) {
                          <p class="muted">No transitions recorded.</p>
                        } @else {
                          <div class="history-list">
                            @for (entry of stateHistory(); track entry.id) {
                              <mat-card appearance="outlined">
                                <mat-card-content>
                                  <strong>{{ entry.fromState || '' }} {{entry.fromState ? '→' : ''}} {{ entry.toState }}</strong>
                                  <p class="muted">{{ entry.createdAt | date: 'medium' }}</p>
                                  <p>{{ entry.reason || 'No reason provided.' }}</p>
                                  <p class="muted">{{ entry.actorName || entry.actorId || 'Unknown' }}</p>
                                </mat-card-content>
                              </mat-card>
                            }
                          </div>
                        }
                      </div>

                      <mat-divider style="margin: 2.5rem 0;"></mat-divider>

                      <div class="work-card-header">
                        <h3 class="work-card-title">Audit history</h3>
                        @if (auditLogs().length === 0) {
                          <p class="muted">No audit entries.</p>
                        } @else {
                          <div class="history-list">
                            @for (log of auditLogs(); track log.id) {
                              <mat-card appearance="outlined">
                                <mat-card-content>
                                  <strong>{{ log.action }}</strong>
                                  <p class="muted">{{ log.createdAt | date: 'medium' }}</p>
                                  <p>{{ log.reasonForChange }}</p>
                                  <p class="muted">{{ log.actorName || log.actorId || 'Unknown' }}</p>
                                </mat-card-content>
                              </mat-card>
                            }
                          </div>
                        }
                      </div>

                      <mat-divider style="margin: 2.5rem 0;"></mat-divider>

                      <div class="work-card-header">
                        <h3 class="work-card-title">Asset supersede history</h3>
                        @if (supersededAssets().length === 0) {
                          <p class="muted">No asset supersede history.</p>
                        } @else {
                          <div class="history-list">
                            @for (asset of supersededAssets(); track asset.id) {
                              <mat-card appearance="outlined">
                                <mat-card-content>
                                  <strong>
                                    {{ getAssetRevisionLabel(asset) }} - {{ asset.caption }}
                                  </strong>
                                  <p class="muted">
                                    Process version v{{ version.versionNumber }} - Uploaded
                                    {{ asset.createdAt | date: 'medium' }}
                                  </p>
                                  <p class="muted">
                                    {{ getAssetMimeTypeLabel(asset) }} - {{ asset.sizeBytes }} bytes
                                  </p>
                                  @if (asset.supersededAt) {
                                    <p class="muted">Superseded: {{ asset.supersededAt | date: 'medium' }}</p>
                                  }
                                </mat-card-content>
                              </mat-card>
                            }
                          </div>
                        }
                      </div>
                    }
                  </mat-card-content>
                </mat-card>
              </div>
            }
          </section>
        </section>
      }
    </section>
  `,
})
export class VersionDetailPageComponent {
  readonly id = input<string>();

  private readonly api = inject(BackofficeApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  private readonly accessControl = inject(AccessControlUtil);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breadcrumbOwner = Symbol('version-detail-page');

  @ViewChild('titleInput', { static: false })
  private readonly titleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('changeDescriptionInput', { static: false })
  private readonly changeDescriptionInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('reasonForChangeInput', { static: false })
  private readonly reasonForChangeInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('architectureStateInput', { static: false })
  private readonly architectureStateInput?: MatSelect;

  protected readonly version = signal<ProcessVersionRecord | null>(null);
  protected readonly process = signal<ProcessRecord | null>(null);
  protected readonly relatedVersions = signal<ProcessVersionRecord[]>([]);
  protected readonly assets = signal<AssetRecord[]>([]);
  protected readonly procedures = signal<ProcedureRecord[]>([]);
  protected readonly previewAssetContent = signal<AssetContentRecord | null>(null);
  protected readonly expandedPreviewAssetId = signal<string | null>(null);
  protected readonly expandedAssetXmlContent = signal<AssetContentRecord | null>(null);
  protected readonly expandedAssetXmlId = signal<string | null>(null);
  protected readonly stateHistory = signal<VersionStateHistoryRecord[]>([]);
  protected readonly auditLogs = signal<AuditLogRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSavingDraft = signal(false);
  protected readonly isActing = signal(false);
  protected readonly isUploading = signal(false);
  protected readonly isSavingProcedure = signal(false);
  protected readonly isDeletingProcedure = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly draftErrorMessage = signal<string | null>(null);
  protected readonly actionErrorMessage = signal<string | null>(null);
  protected readonly uploadErrorMessage = signal<string | null>(null);
  protected readonly procedureErrorMessage = signal<string | null>(null);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly selectedTab = signal<VersionDetailTabId>('summary');
  protected readonly editingProcedureId = signal<string | null>(null);
  private readonly requestedTab = toSignal(
    this.route.queryParamMap.pipe(map((params) => this.parseTab(params.get('tab')))),
    { initialValue: null },
  );

  protected readonly historyAvailable = computed(() =>
    canAccessGovernanceHistory(this.auth.currentUser()?.role.name),
  );
  protected readonly currentUserRole = computed(() => this.auth.currentUser()?.role.name);
  protected readonly editorCanManageVersion = computed(() =>
    this.accessControl.canManageVersion(this.process(), this.version()),
  );
  protected readonly visibleActions = computed(() => {
    const role = this.auth.currentUser()?.role.name;

    if (role === 'EDITOR' && !this.editorCanManageVersion()) {
      return [];
    }

    if (role === 'REVIEWER' && !this.accessControl.canReviewVersion(this.process())) {
      return [];
    }

    return getVisibleLifecycleActions(role, this.version());
  });
  protected readonly canEditDraft = computed(() => this.editorCanManageVersion());
  protected readonly canUploadBpmn = computed(() => this.editorCanManageVersion());
  protected readonly primaryActionTabLabel = computed(() => {
    const version = this.version();

    if (!version) {
      return 'Action';
    }

    if (this.canEditDraft()) {
      return 'Edit draft';
    }

    if (this.showReviewChecklist()) {
      return 'Review';
    }

    if (this.currentUserRole() === 'PUBLISHER') {
      return version.lifecycleState === 'Approved' ? 'Publish' : 'Release actions';
    }

    return 'Context';
  });
  protected readonly showReviewChecklist = computed(() => {
    const version = this.version();
    return this.currentUserRole() === 'REVIEWER' && version?.lifecycleState === 'In Review';
  });
  protected readonly canShowChecklist = computed(
    () => this.canEditDraft() || this.showReviewChecklist(),
  );
  protected readonly tabs = computed(() => {
    const tabs: { id: VersionDetailTabId; label: string }[] = [
      { id: 'summary', label: 'Summary' },
    ];

    tabs.push({ id: 'work', label: this.primaryActionTabLabel() });

    tabs.push(
      { id: 'diagram', label: 'Diagram' },
      { id: 'procedures', label: 'Procedures' },
    );

    if (this.historyAvailable()) {
      tabs.push({ id: 'history', label: 'History' });
    }

    return tabs;
  });
  protected readonly hasBpmnAsset = computed(() => this.assets().length > 0);
  protected readonly currentAssets = computed(() =>
    this.assets().filter((asset) => asset.isCurrent),
  );
  protected readonly supersededAssets = computed(() =>
    this.assets().filter((asset) => !asset.isCurrent),
  );
  protected readonly assetTimeline = computed(() => [...this.assets()].reverse());
  protected readonly previewAsset = computed(() => {
    const previewAssetId =
      this.expandedPreviewAssetId() ?? this.previewAssetContent()?.id;

    return (
      this.assets().find((asset) => asset.id === previewAssetId) ??
      this.currentAssets()[0] ??
      this.assetTimeline()[0] ??
      null
    );
  });
  protected readonly diagramPreviewXml = computed(
    () => this.previewAssetContent()?.content ?? null,
  );
  protected readonly currentAsset = computed(() => this.currentAssets()[0] ?? null);
  protected readonly uploadSubmitLabel = computed(() =>
    this.selectedFile() ? 'Submit asset' : 'Upload BPMN',
  );
  protected readonly diagramPreviewTitle = computed(() => {
    const asset = this.previewAsset();

    if (!asset) {
      return 'Visualize the BPMN diagram';
    }

    return `${asset.caption} (${this.getAssetRevisionLabel(asset)})`;
  });
  protected readonly diagramPreviewSubtitle = computed(() => {
    const asset = this.previewAsset();
    const version = this.version();

    if (!asset || !version) {
      return 'Use the controls to fit, zoom, and inspect the selected BPMN revision.';
    }

    return `Process version v${version.versionNumber} - ${this.getAssetRevisionLabel(asset)} - ${
      asset.isCurrent ? 'Current uploaded revision' : 'Superseded uploaded revision'
    }.`;
  });
  protected readonly hasProcedure = computed(() => this.procedures().length > 0);
  protected readonly architectureStateSelected = computed(() => {
    const architectureState = this.draftForm.controls.architectureState.value;
    return architectureState === 'AS-IS' || architectureState === 'TO-BE';
  });
  protected readonly submissionRequirements = computed(() => ({
    titlePresent: this.draftForm.controls.title.getRawValue().trim().length > 0,
    changeDescriptionPresent:
      this.draftForm.controls.changeDescription.getRawValue().trim().length > 0,
    reasonForChangePresent:
      this.draftForm.controls.reasonForChange.getRawValue().trim().length > 0,
    architectureStateSelected: this.architectureStateSelected(),
    hasBpmnAsset: this.hasBpmnAsset(),
    hasProcedure: this.hasProcedure(),
  }));
  protected readonly nextChecklistItem = computed(() => {
    if (this.showReviewChecklist()) {
      const checklistState = this.checklistState();

      if (!checklistState.titleChecked) {
        return {
          label: 'Confirm the title is correct',
          action: () => this.selectTabAndFocus('work', 'title'),
        };
      }
      if (!checklistState.changeChecked) {
        return {
          label: 'Confirm the change description is correct',
          action: () => this.selectTabAndFocus('work', 'changeDescription'),
        };
      }
      if (!checklistState.requirementsChecked) {
        return {
          label: 'Confirm the reason for change is correct',
          action: () => this.selectTabAndFocus('work', 'reasonForChange'),
        };
      }
      if (!checklistState.architectureChecked) {
        return {
          label: 'Confirm the architecture state is correct',
          action: () => this.selectTabAndFocus('work', 'architectureState'),
        };
      }
      if (!checklistState.diagramProceduresChecked) {
        return {
          label: 'Check that the BPMN diagram reflects the documented procedures',
          action: () => this.selectTab('diagram'),
        };
      }
      return null;
    }

    if (!this.canEditDraft()) {
      return null;
    }

    const submissionRequirements = this.submissionRequirements();

    if (!submissionRequirements.titlePresent) {
      return { label: 'Fill in the title', action: () => this.selectTabAndFocus('work', 'title') };
    }
    if (!submissionRequirements.changeDescriptionPresent) {
      return {
        label: 'Fill in the change description',
        action: () => this.selectTabAndFocus('work', 'changeDescription'),
      };
    }
    if (!submissionRequirements.reasonForChangePresent) {
      return {
        label: 'Fill in the reason for change',
        action: () => this.selectTabAndFocus('work', 'reasonForChange'),
      };
    }
    if (!submissionRequirements.architectureStateSelected) {
      return {
        label: 'Select the architecture state',
        action: () => this.selectTabAndFocus('work', 'architectureState'),
      };
    }
    if (!submissionRequirements.hasBpmnAsset) {
      return { label: 'Upload the BPMN diagram', action: () => this.selectTab('diagram') };
    }
    if (!submissionRequirements.hasProcedure) {
      return { label: 'Add at least 1 procedure', action: () => this.selectTab('procedures') };
    }
    return null;
  });
  protected readonly allChecklistChecked = computed(() => {
    if (this.showReviewChecklist()) {
      const checklistState = this.checklistState();

      return (
        checklistState.titleChecked &&
        checklistState.changeChecked &&
        checklistState.requirementsChecked &&
        checklistState.architectureChecked &&
        checklistState.diagramProceduresChecked
      );
    }

    if (this.version()?.lifecycleState !== 'Draft') {
      return this.version()?.checklistCompleted ?? false;
    }

    const submissionRequirements = this.submissionRequirements();

    return (
      submissionRequirements.titlePresent &&
      submissionRequirements.changeDescriptionPresent &&
      submissionRequirements.reasonForChangePresent &&
      submissionRequirements.architectureStateSelected &&
      submissionRequirements.hasBpmnAsset &&
      submissionRequirements.hasProcedure
    );
  });
  protected readonly selectedFileName = computed(() => this.selectedFile()?.name ?? null);
  protected readonly showPromoteTitleField = computed(() =>
    this.visibleActions().some((action) => action.key === 'promote'),
  );
  protected readonly workflowSummary = computed(() => {
    const currentVersion = this.version();
    const activeWorkflowVersion = this.process()?.governanceSummary?.activeWorkflowVersion;

    if (!currentVersion || !activeWorkflowVersion || activeWorkflowVersion.id !== currentVersion.id) {
      return null;
    }

    return activeWorkflowVersion;
  });
  protected readonly waitingForRoleLabel = computed(
    () => this.workflowSummary()?.waitingForRole ?? this.getWaitingForRoleLabel(this.version()),
  );
  protected readonly nextActionLabel = computed(
    () => this.workflowSummary()?.nextAction ?? this.getNextActionLabel(this.version()),
  );
  protected readonly isWaitingForCurrentUser = computed(() => {
    const waitingForRole = this.waitingForRoleLabel();
    const currentRole = this.currentUserRole();

    return Boolean(
      currentRole &&
        waitingForRole !== '-' &&
        waitingForRole === currentRole,
    );
  });
  protected readonly workPanelTitle = computed(() => {
    if (this.canEditDraft()) {
      return 'Required work';
    }

    switch (this.currentUserRole()) {
      case 'REVIEWER':
        return 'Review context';
      case 'PUBLISHER':
        return 'Publication context';
      default:
        return 'Version context';
    }
  });
  protected readonly workPanelDescription = computed(() => {
    if (this.canEditDraft()) {
      return 'Complete the draft content here before you move the version forward.';
    }

    switch (this.currentUserRole()) {
      case 'REVIEWER':
        return 'Use this evidence to validate the draft, complete the review checklist, and record your decision.';
      case 'PUBLISHER':
        return 'Use this context to confirm release readiness before you publish, archive, or promote.';
      default:
        return 'Use this context to understand the version before taking any action.';
    }
  });
  protected readonly derivedFromVersionLabel = computed(() => {
    const currentVersion = this.version();
    const derivedFromVersionId = currentVersion?.derivedFromVersionId;

    if (!derivedFromVersionId) {
      return null;
    }

    const relatedVersion = this.relatedVersions().find((version) => version.id === derivedFromVersionId);

    if (!relatedVersion) {
      return 'the linked earlier version';
    }

    return `v${relatedVersion.versionNumber} - ${relatedVersion.title}`;
  });
  protected readonly headerTitle = computed(() => {
    const version = this.version();
    const process = this.process();

    if (!version || !process) {
      return 'Version detail';
    }

    return `${process.code} - ${version.title}`;
  });
  protected readonly headerSubtitle = computed(() => {
    const process = this.process();
    const version = this.version();

    if (!process || !version) {
      return 'Review the version, complete work, manage diagrams, and trace governance history.';
    }

    return `${process.title} - ${process.teamName} team - Owner ${process.ownerName} - Version v${version.versionNumber}`;
  });
  protected readonly checklistTitle = computed(() =>
    this.canEditDraft() ? 'Submission readiness' : 'Review checklist',
  );
  protected readonly submissionReadinessLabel = computed(() => {
    const version = this.version();

    if (this.showReviewChecklist()) {
      return this.allChecklistChecked() ? 'Ready to approve' : 'Review still incomplete';
    }

    if (version?.lifecycleState === 'Draft') {
      return this.allChecklistChecked() ? 'Ready for review' : 'Still incomplete';
    }

    if (version?.lifecycleState === 'In Review') {
      return 'In review';
    }

    return version?.checklistCompleted ? 'Reviewer checklist complete' : 'Checklist pending';
  });
  protected readonly nextChecklistCompleteLabel = computed(() => {
    const version = this.version();

    if (this.showReviewChecklist()) {
      return 'Review checklist complete. Ready to approve.';
    }

    if (this.canEditDraft()) {
      return 'All requirements met. Ready to submit.';
    }

    if (this.currentUserRole() === 'PUBLISHER' && version?.lifecycleState === 'Approved') {
      return 'Verify it is ready for publishing, then click Publish.';
    }

    if (this.currentUserRole() === 'PUBLISHER' && version?.lifecycleState === 'Published') {
      return 'Review the release status and use archive or promote when needed.';
    }

    return 'Review the version context and use the available decision action.';
  });
  protected readonly governanceSummaryText = computed(() => {
    const version = this.version();

    if (!version) {
      return '';
    }

    if (version.lifecycleState === 'Draft') {
      return `This version is draft in ${version.architectureState} state and ${
        this.allChecklistChecked()
          ? 'meets the draft submission requirements.'
          : 'does not yet meet the draft submission requirements.'
      }`;
    }

    return `This version is ${version.lifecycleState.toLowerCase()} in ${
      version.architectureState
    } state and ${
      version.checklistCompleted
        ? 'has completed reviewer verification.'
        : 'is still awaiting reviewer verification.'
    }`;
  });
  protected readonly summaryDiagramStatus = computed(() => {
    const currentAsset = this.currentAsset();

    if (!currentAsset) {
      return 'No BPMN uploaded yet';
    }

    return `${this.getAssetRevisionLabel(currentAsset)} current revision uploaded`;
  });
  protected readonly editingProcedure = computed(() =>
    this.procedures().find((procedure) => procedure.id === this.editingProcedureId()) ?? null,
  );
  protected readonly procedurePanelTitle = computed(() =>
    this.editingProcedure()
      ? `Edit ${this.editingProcedure()?.code ?? 'procedure'}`
      : 'Add procedure',
  );
  protected readonly procedureSubmitLabel = computed(() =>
    this.editingProcedure() ? 'Save procedure changes' : 'Create procedure',
  );

  protected readonly draftForm = this.fb.group({
    architectureState: ['AS-IS' as 'AS-IS' | 'TO-BE', [Validators.required]],
    title: ['', [Validators.required]],
    derivedFromVersionId: [''],
    changeDescription: ['', [Validators.required]],
    reasonForChange: ['', [Validators.required]],
  });

  protected readonly checklistForm = this.fb.group({
    titleChecked: [false],
    changeChecked: [false],
    requirementsChecked: [false],
    architectureChecked: [false],
    diagramProceduresChecked: [false],
  });

  protected readonly uploadForm = this.fb.group({
    caption: ['', [Validators.required]],
  });

  protected readonly procedureForm = this.fb.group({
    title: ['', [Validators.required]],
    utility: ['', [Validators.required]],
    warranty: ['', [Validators.required]],
    outcome: ['', [Validators.required]],
    policy: ['', [Validators.required]],
    inputsText: ['', [nonEmptyLineListValidator()]],
    outputsText: ['', [nonEmptyLineListValidator()]],
    activities: this.fb.array([], [minItemsValidator(1)]),
  });

  protected readonly actionForm = this.fb.group({
    reason: [''],
    promotionTitle: [''],
  });

  protected readonly checklistState = toSignal(this.checklistForm.valueChanges, {
    initialValue: this.checklistForm.getRawValue(),
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.breadcrumbs.clearOverride(this.breadcrumbOwner);
    });

    effect(() => {
      const versionId = this.id();
      if (versionId) {
        void this.loadPage(versionId);
      }
    });

    effect(() => {
      const version = this.version();
      const requestedTab = this.requestedTab();

      if (!version) {
        return;
      }

      if (requestedTab && this.isTabAvailable(requestedTab)) {
        if (this.selectedTab() !== requestedTab) {
          this.selectedTab.set(requestedTab);
        }
        return;
      }

      if (!this.isTabAvailable(this.selectedTab())) {
        this.selectedTab.set(this.resolveDefaultTab());
      }
    });

    effect(() => {
      const version = this.version();
      const process = this.process();
      const selectedTab = this.selectedTab();

      if (!version || !process) {
        return;
      }

      this.breadcrumbs.setOverride(this.breadcrumbOwner, [
        { label: 'Processes', url: '/processes' },
        { label: process.title },
        { label: 'Versions', url: `/processes/${process.id}/versions` },
        { label: `v${version.versionNumber}` },
        { label: this.getTabLabel(selectedTab) },
      ]);
    });
  }

  protected async saveDraft(): Promise<void> {
    await this.persistDraft(true);
  }

  protected selectTab(tabId: VersionDetailTabId): void {
    if (!this.isTabAvailable(tabId)) {
      return;
    }

    this.selectedTab.set(tabId);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected selectTabAndFocus(tabId: VersionDetailTabId, inputId: string): void {
    this.selectTab(tabId);

    // Use setTimeout to wait for the tab transition to complete
    setTimeout(() => {
      let focusTarget: { focus: () => void } | undefined;
      switch (inputId) {
        case 'title':
          focusTarget = this.titleInput?.nativeElement;
          break;
        case 'changeDescription':
          focusTarget = this.changeDescriptionInput?.nativeElement;
          break;
        case 'reasonForChange':
          focusTarget = this.reasonForChangeInput?.nativeElement;
          break;
        case 'architectureState':
          focusTarget = this.architectureStateInput;
          break;
      }

      if (focusTarget) {
        focusTarget.focus();
      }
    }, 100);
  }

  protected executeNextChecklistAction(): void {
    const nextItem = this.nextChecklistItem();
    if (nextItem) {
      nextItem.action();
    }
  }

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement | null)?.files?.[0] ?? null;
    this.selectedFile.set(file);
  }

  protected async uploadAsset(): Promise<void> {
    const currentVersion = this.version();
    const file = this.selectedFile();

    if (!currentVersion || !file || this.uploadForm.invalid) {
      this.uploadForm.markAllAsTouched();
      this.uploadErrorMessage.set('Select a BPMN file and provide a caption first.');
      return;
    }

    this.isUploading.set(true);
    this.uploadErrorMessage.set(null);

    try {
      await firstValueFrom(
        this.api.uploadBpmnAsset(
          currentVersion.id,
          this.uploadForm.controls.caption.getRawValue(),
          file,
        ),
      );

      this.uploadForm.reset({ caption: '' });
      this.selectedFile.set(null);
      this.previewAssetContent.set(null);
      this.expandedPreviewAssetId.set(null);
      this.expandedAssetXmlContent.set(null);
      this.expandedAssetXmlId.set(null);
      await this.reloadSupportingData(currentVersion);
      this.toast.success('BPMN asset uploaded successfully');
    } catch (error) {
      this.uploadErrorMessage.set(
        getHttpErrorMessage(error, 'Unable to upload the BPMN asset.'),
      );
      this.toast.error('Failed to upload BPMN asset');
    } finally {
      this.isUploading.set(false);
    }
  }

  protected isPreviewedAsset(asset: AssetRecord): boolean {
    return this.expandedPreviewAssetId() === asset.id;
  }

  protected getAssetRevisionLabel(asset: AssetRecord): string {
    return `v${this.getAssetRevisionNumber(asset)}`;
  }

  protected getAssetMimeTypeLabel(asset: AssetRecord): string {
    if (
      asset.mimeType === 'application/octet-stream' &&
      /\.(bpmn|xml)$/i.test(asset.filePath)
    ) {
      return 'application/xml';
    }

    return asset.mimeType;
  }

  protected async toggleAssetPreview(asset: AssetRecord): Promise<void> {
    if (this.expandedPreviewAssetId() === asset.id) {
      this.expandedPreviewAssetId.set(null);
      return;
    }

    try {
      this.previewAssetContent.set(await this.loadAssetContent(asset));
      this.expandedPreviewAssetId.set(asset.id);

      if (this.expandedAssetXmlId() && this.expandedAssetXmlId() !== asset.id) {
        this.expandedAssetXmlId.set(null);
      }
    } catch (error) {
      this.uploadErrorMessage.set(
        getHttpErrorMessage(error, 'Unable to load the BPMN asset preview.'),
      );
    }
  }

  protected async previewAssetRevision(asset: AssetRecord): Promise<void> {
    await this.toggleAssetPreview(asset);
  }

  protected async toggleAssetXml(asset: AssetRecord): Promise<void> {
    if (this.expandedAssetXmlId() === asset.id) {
      this.expandedAssetXmlId.set(null);
      this.expandedAssetXmlContent.set(null);
      return;
    }

    try {
      this.expandedAssetXmlContent.set(await this.loadAssetContent(asset));
      this.expandedAssetXmlId.set(asset.id);
    } catch (error) {
      this.uploadErrorMessage.set(
        getHttpErrorMessage(error, 'Unable to load the BPMN asset XML.'),
      );
    }
  }

  protected procedureActivities(): FormArray {
    return this.procedureForm.controls.activities;
  }

  protected addProcedureActivity(
    activity?: Partial<ProcedureActivityFormValue>,
  ): void {
    this.procedureActivities().push(this.createProcedureActivityGroup(activity));
  }

  protected removeProcedureActivity(index: number): void {
    this.procedureActivities().removeAt(index);
  }

  protected startEditingProcedure(procedure: ProcedureRecord): void {
    this.editingProcedureId.set(procedure.id);
    this.procedureErrorMessage.set(null);
    this.procedureForm.reset({
      title: procedure.title,
      utility: procedure.utility ?? '',
      warranty: procedure.warranty ?? '',
      outcome: procedure.outcome ?? '',
      policy: procedure.policy ?? '',
      inputsText: this.stringifyProcedureList(procedure.inputs),
      outputsText: this.stringifyProcedureList(procedure.outputs),
    });
    this.resetProcedureActivities(
      this.mapProcedureActivitiesToForm(procedure.activities),
    );
  }

  protected cancelProcedureEdit(): void {
    this.editingProcedureId.set(null);
    this.procedureErrorMessage.set(null);
    this.resetProcedureForm();
  }

  protected async saveProcedure(): Promise<void> {
    const currentVersion = this.version();

    if (!currentVersion || this.procedureForm.invalid) {
      this.procedureForm.markAllAsTouched();
      this.procedureErrorMessage.set(
        'Complete the required procedure fields before saving.',
      );
      return;
    }

    const payload = {
      title: this.procedureForm.controls.title.getRawValue().trim(),
      utility: this.procedureForm.controls.utility.getRawValue().trim(),
      warranty: this.procedureForm.controls.warranty.getRawValue().trim(),
      outcome: this.procedureForm.controls.outcome.getRawValue().trim(),
      policy: this.procedureForm.controls.policy.getRawValue().trim(),
      activities: this.procedureActivities().controls.map((control) => {
        const value = control.getRawValue() as ProcedureActivityFormValue;

        return {
          resource: value.resource.trim(),
          serviceAction: value.serviceAction.trim(),
          workInstruction: value.workInstruction.trim(),
        };
      }),
      inputs: this.parseProcedureList(
        this.procedureForm.controls.inputsText.getRawValue(),
      ),
      outputs: this.parseProcedureList(
        this.procedureForm.controls.outputsText.getRawValue(),
      ),
    };

    this.isSavingProcedure.set(true);
    this.procedureErrorMessage.set(null);

    try {
      if (this.editingProcedureId()) {
        await firstValueFrom(
          this.api.updateProcedure(this.editingProcedureId()!, payload),
        );
        this.toast.success('Procedure updated successfully');
      } else {
        await firstValueFrom(this.api.createProcedure(currentVersion.id, payload));
        this.toast.success('Procedure created successfully');
      }

      await this.reloadSupportingData(currentVersion);
      this.cancelProcedureEdit();
    } catch (error) {
      this.procedureErrorMessage.set(
        getHttpErrorMessage(error, 'Unable to save the procedure.'),
      );
      this.toast.error('Failed to save procedure');
    } finally {
      this.isSavingProcedure.set(false);
    }
  }

  protected async deleteProcedure(id: string): Promise<void> {
    const currentVersion = this.version();

    if (!currentVersion) {
      return;
    }

    this.isDeletingProcedure.set(true);
    this.procedureErrorMessage.set(null);

    try {
      await firstValueFrom(this.api.deleteProcedure(id));
      await this.reloadSupportingData(currentVersion);

      if (this.editingProcedureId() === id) {
        this.cancelProcedureEdit();
      }

      this.toast.success('Procedure deleted successfully');
    } catch (error) {
      this.procedureErrorMessage.set(
        getHttpErrorMessage(error, 'Unable to delete the procedure.'),
      );
      this.toast.error('Failed to delete procedure');
    } finally {
      this.isDeletingProcedure.set(false);
    }
  }

  protected async confirmDeleteProcedure(procedure: ProcedureRecord): Promise<void> {
    const confirmed = await firstValueFrom(
      this.dialog
        .open(ConfirmDeleteDialogComponent, {
          data: {
            title: 'Delete procedure',
            message: `Delete procedure "${procedure.code} - ${procedure.title}"? This removes the draft procedure from the current version and cannot be undone.`,
            confirmLabel: 'Delete procedure',
          },
        })
        .afterClosed(),
    );

    if (!confirmed) {
      return;
    }

    await this.deleteProcedure(procedure.id);
  }

  protected async runLifecycleAction(action: LifecycleActionDefinition): Promise<void> {
    const currentVersion = this.version();

    if (!currentVersion) {
      return;
    }

    const reason = this.actionForm.controls.reason.getRawValue().trim();
    const promotionTitle = this.actionForm.controls.promotionTitle.getRawValue().trim();

    if (action.reasonMode === 'required' && reason.length === 0) {
      this.actionErrorMessage.set('A justification is required for this action.');
      return;
    }

    this.isActing.set(true);
    this.actionErrorMessage.set(null);

    try {
      switch (action.key) {
        case 'submit':
          if (!this.allChecklistChecked()) {
            this.actionErrorMessage.set(
              'Complete the draft metadata, upload a BPMN diagram, and define at least one procedure before submitting.',
            );
            return;
          }

          await this.persistDraft(false);
          await firstValueFrom(
            this.api.submitVersionForReview(currentVersion.id, reason || undefined),
          );
          this.toast.success('Version submitted for review');
          break;
        case 'approve':
          if (!this.allChecklistChecked()) {
            this.actionErrorMessage.set('Complete the review checklist before approving.');
            return;
          }

          await firstValueFrom(this.api.approveVersion(currentVersion.id, reason || undefined));
          this.toast.success('Version approved');
          break;
        case 'reject':
          await firstValueFrom(this.api.rejectVersion(currentVersion.id, reason));
          this.toast.success('Version rejected');
          break;
        case 'reopen':
          await firstValueFrom(this.api.reopenVersion(currentVersion.id, reason));
          this.toast.success('Version reopened');
          break;
        case 'publish':
          await firstValueFrom(this.api.publishVersion(currentVersion.id, reason || undefined));
          this.toast.success('Version published');
          break;
        case 'archive':
          await firstValueFrom(this.api.archiveVersion(currentVersion.id, reason));
          this.toast.success('Version archived');
          break;
        case 'promote': {
          const promotedVersion = await firstValueFrom(
            this.api.promoteVersion(currentVersion.id, reason, promotionTitle || undefined),
          );
          this.toast.success('Version promoted successfully');
          await this.router.navigate(['/versions', promotedVersion.id]);
          return;
        }
      }

      this.actionForm.reset({ reason: '', promotionTitle: '' });
      await this.loadPage(currentVersion.id);
    } catch (error) {
      this.actionErrorMessage.set(
        getHttpErrorMessage(error, 'Unable to perform the lifecycle action.'),
      );
      this.toast.error('Failed to perform lifecycle action');
    } finally {
      this.isActing.set(false);
    }
  }

  private async loadPage(versionId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.draftErrorMessage.set(null);
    this.actionErrorMessage.set(null);
    this.uploadErrorMessage.set(null);
    this.procedureErrorMessage.set(null);

    try {
      const version = await firstValueFrom(this.api.getVersion(versionId));
      const [process, relatedVersions] = await Promise.all([
        firstValueFrom(this.api.getProcess(version.processId)),
        firstValueFrom(this.api.listProcessVersions(version.processId)),
      ]);

      this.version.set(version);
      this.process.set(process);
      this.relatedVersions.set(relatedVersions);
      this.selectedTab.set(this.resolveInitialTab());
      this.patchDraftState(version);
      this.resetChecklistState();
      this.cancelProcedureEdit();
      await this.reloadSupportingData(version);
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load the version detail.'));
    } finally {
      this.isLoading.set(false);
    }
  }

  private async reloadSupportingData(version: ProcessVersionRecord): Promise<void> {
    const [assets, procedures] = await Promise.all([
      firstValueFrom(this.api.listAssets(version.id)),
      firstValueFrom(this.api.listProcedures(version.id)),
    ]);
    this.assets.set(assets);
    this.procedures.set(procedures);

    if (this.historyAvailable()) {
      try {
        const [stateHistory, auditLogs] = await Promise.all([
          firstValueFrom(this.api.getVersionStateHistory(version.id)),
          firstValueFrom(this.api.getAuditLogs('process_version', version.id)),
        ]);

        this.stateHistory.set(stateHistory);
        this.auditLogs.set(auditLogs);
      } catch {
        this.stateHistory.set([]);
        this.auditLogs.set([]);
      }
    } else {
      this.stateHistory.set([]);
      this.auditLogs.set([]);
    }

    if (!assets.some((asset) => asset.id === this.previewAssetContent()?.id)) {
      this.previewAssetContent.set(null);
    }

    if (!assets.some((asset) => asset.id === this.expandedPreviewAssetId())) {
      this.expandedPreviewAssetId.set(null);
    }

    if (!assets.some((asset) => asset.id === this.expandedAssetXmlId())) {
      this.expandedAssetXmlId.set(null);
      this.expandedAssetXmlContent.set(null);
    }

    await this.ensurePreviewAssetContent(assets);
  }

  private getAssetRevisionNumber(asset: AssetRecord): number {
    const index = this.assets().findIndex(
      (candidateAsset) => candidateAsset.id === asset.id,
    );

    return index >= 0 ? index + 1 : this.assets().length;
  }

  private async loadAssetContent(asset: AssetRecord): Promise<AssetContentRecord> {
    const currentPreview = this.previewAssetContent();

    if (currentPreview?.id === asset.id) {
      return currentPreview;
    }

    return await firstValueFrom(
      this.api.getAssetContent(asset.processVersionId, asset.id),
    );
  }

  private async ensurePreviewAssetContent(assets: AssetRecord[]): Promise<void> {
    if (assets.length === 0) {
      this.previewAssetContent.set(null);
      this.expandedPreviewAssetId.set(null);
      return;
    }

    const currentPreviewId =
      this.expandedPreviewAssetId() ?? this.previewAssetContent()?.id;
    const assetToPreview =
      (currentPreviewId
        ? assets.find((asset) => asset.id === currentPreviewId)
        : null) ??
      assets.find((asset) => asset.isCurrent) ??
      assets[assets.length - 1] ??
      null;

    if (!assetToPreview || this.previewAssetContent()?.id === assetToPreview.id) {
      return;
    }

    try {
      this.previewAssetContent.set(await this.loadAssetContent(assetToPreview));
      this.expandedPreviewAssetId.set(assetToPreview.id);
    } catch {
      this.previewAssetContent.set(null);
    }
  }

  private patchDraftState(version: ProcessVersionRecord): void {
    this.draftForm.reset({
      architectureState: version.architectureState,
      title: version.title,
      derivedFromVersionId: version.derivedFromVersionId ?? '',
      changeDescription: version.changeDescription,
      reasonForChange: version.reasonForChange,
    });
  }

  private resetChecklistState(): void {
    this.checklistForm.reset({
      titleChecked: false,
      changeChecked: false,
      requirementsChecked: false,
      architectureChecked: false,
      diagramProceduresChecked: false,
    });
  }

  private resolveInitialTab(): VersionDetailTabId {
    const requestedTab = this.requestedTab();

    if (requestedTab && this.isTabAvailable(requestedTab)) {
      return requestedTab;
    }

    return this.resolveDefaultTab();
  }

  private resolveDefaultTab(): VersionDetailTabId {
    if (this.version()) {
      return 'work';
    }

    return 'summary';
  }

  private isTabAvailable(tabId: VersionDetailTabId): boolean {
    return this.tabs().some((tab) => tab.id === tabId);
  }

  private getTabLabel(tabId: VersionDetailTabId): string {
    return this.tabs().find((tab) => tab.id === tabId)?.label ?? 'Summary';
  }

  private getWaitingForRoleLabel(version: ProcessVersionRecord | null): string {
    if (!version) {
      return '-';
    }

    switch (version.lifecycleState) {
      case 'Draft':
        return 'EDITOR';
      case 'In Review':
        return 'REVIEWER';
      case 'Approved':
      case 'Published':
        return 'PUBLISHER';
      default:
        return '-';
    }
  }

  private getNextActionLabel(version: ProcessVersionRecord | null): string {
    if (!version) {
      return '-';
    }

    switch (version.lifecycleState) {
      case 'Draft':
        return 'Complete the draft and submit it for review.';
      case 'In Review':
        return 'Complete the review checklist, then approve or reject the version.';
      case 'Approved':
        return 'Publish the version or reopen it if more changes are needed.';
      case 'Published':
        return version.architectureState === 'TO-BE'
          ? 'Publish follow-on governance actions such as archive or promote.'
          : 'Archive the version when it is no longer current.';
      case 'Archived':
        return 'No further lifecycle action is required.';
      default:
        return '-';
    }
  }

  private parseTab(value: string | null): VersionDetailTabId | null {
    switch (value) {
      case 'summary':
      case 'overview':
        return 'summary';
      case 'work':
      case 'workflow':
        return 'work';
      case 'diagram':
      case 'bpmn':
        return 'diagram';
      case 'procedures':
      case 'history':
        return value;
      default:
        return null;
    }
  }

  private createProcedureActivityGroup(
    activity?: Partial<ProcedureActivityFormValue>,
  ) {
    return this.fb.group({
      resource: [activity?.resource ?? '', [Validators.required]],
      serviceAction: [activity?.serviceAction ?? '', [Validators.required]],
      workInstruction: [activity?.workInstruction ?? '', [Validators.required]],
    });
  }

  private resetProcedureActivities(
    activities: ProcedureActivityFormValue[] = [],
  ): void {
    this.procedureActivities().clear();

    for (const activity of activities) {
      this.procedureActivities().push(this.createProcedureActivityGroup(activity));
    }
  }

  private resetProcedureForm(): void {
    this.procedureForm.reset({
      title: '',
      utility: '',
      warranty: '',
      outcome: '',
      policy: '',
      inputsText: '',
      outputsText: '',
    });
    this.resetProcedureActivities();
  }

  private mapProcedureActivitiesToForm(
    activities: Record<string, unknown>[] | null | undefined,
  ): ProcedureActivityFormValue[] {
    return (activities ?? []).map((activity) => ({
      resource: this.readProcedureString(activity, ['resource', 'Resource']),
      serviceAction: this.readProcedureString(activity, [
        'service_action',
        'serviceAction',
        'Service Action',
      ]),
      workInstruction: this.readProcedureString(activity, [
        'work_instruction',
        'workInstruction',
        'Work Instruction',
      ]),
    }));
  }

  private stringifyProcedureList(
    items: unknown[] | null | undefined,
  ): string {
    return (items ?? [])
      .map((item) =>
        typeof item === 'string' ? item : JSON.stringify(item),
      )
      .join('\n');
  }

  private parseProcedureList(value: string): string[] {
    return value
      .split('\n')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  private readProcedureString(
    activity: Record<string, unknown>,
    keys: string[],
  ): string {
    for (const key of keys) {
      const value = activity[key];

      if (typeof value === 'string') {
        return value;
      }
    }

    return '';
  }

  private async persistDraft(showMessageOnError: boolean): Promise<void> {
    const currentVersion = this.version();

    if (!currentVersion || this.draftForm.invalid) {
      this.draftForm.markAllAsTouched();
      if (showMessageOnError) {
        this.draftErrorMessage.set('Complete the required draft fields before saving.');
      }
      throw new Error('Draft form is invalid.');
    }

    this.isSavingDraft.set(true);
    if (showMessageOnError) {
      this.draftErrorMessage.set(null);
    }

    try {
      const updatedVersion = await firstValueFrom(
        this.api.updateVersion(currentVersion.id, {
          architectureState: this.draftForm.controls.architectureState.getRawValue(),
          title: this.draftForm.controls.title.getRawValue(),
          derivedFromVersionId: this.draftForm.controls.derivedFromVersionId.getRawValue() || null,
          changeDescription: this.draftForm.controls.changeDescription.getRawValue(),
          reasonForChange: this.draftForm.controls.reasonForChange.getRawValue(),
        }),
      );

      this.version.set(updatedVersion);
      this.patchDraftState(updatedVersion);
      if (showMessageOnError) {
        this.toast.success('Draft saved successfully');
      }
    } catch (error) {
      if (showMessageOnError) {
        this.draftErrorMessage.set(
          getHttpErrorMessage(error, 'Unable to save the draft changes.'),
        );
        this.toast.error('Failed to save draft');
      }

      throw error;
    } finally {
      this.isSavingDraft.set(false);
    }
  }
}
