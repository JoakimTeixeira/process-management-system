import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

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
import {
  AssetContentRecord,
  AssetRecord,
  AuditLogRecord,
  ProcedureRecord,
  ProcessRecord,
  ProcessVersionRecord,
  VersionStateHistoryRecord,
} from '../../core/models/backoffice.models';

type VersionDetailTabId =
  | 'summary'
  | 'work'
  | 'diagram'
  | 'procedures'
  | 'history';

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
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
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
            <h1>{{ version.title }}</h1>
            <p class="muted">Review the version, complete work, manage diagrams, and trace governance history.</p>
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
                <mat-card appearance="outlined" style="margin-bottom: 1rem;">
                  <mat-card-header>
                    <mat-card-subtitle>
                      @if (process(); as process) {
                        {{ process.code }} - {{ process.title }}
                      }
                    </mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-chip-set>
                      <mat-chip>v{{ version.versionNumber }}</mat-chip>
                      <mat-chip>{{ version.lifecycleState }}</mat-chip>
                      <mat-chip>{{ version.architectureState }}</mat-chip>
                    </mat-chip-set>
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
                              <mat-select formControlName="architectureState">
                                <mat-option value="AS-IS">AS-IS</mat-option>
                                <mat-option value="TO-BE">TO-BE</mat-option>
                              </mat-select>
                            </mat-form-field>

                            <mat-form-field appearance="outline">
                              <mat-label>Title</mat-label>
                              <input matInput formControlName="title" />
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
                              <textarea matInput rows="5" formControlName="changeDescription"></textarea>
                            </mat-form-field>

                            <mat-form-field appearance="outline">
                              <mat-label>Reason for change</mat-label>
                              <textarea matInput rows="5" formControlName="reasonForChange"></textarea>
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
                                <p class="muted">{{ process.teamName }} team · Owner {{ process.ownerName }}</p>
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
                          <p>{{ nextActionLabel() }}</p>
                        </div>
                      </mat-card-content>
                    </mat-card>

                    @if (canShowChecklist()) {
                      <mat-card appearance="outlined">
                        <mat-card-header>
                          <mat-card-title>Checklist</mat-card-title>
                        </mat-card-header>
                        <mat-card-content>
                          <form [formGroup]="checklistForm">
                            <mat-checkbox formControlName="titleChecked">
                              Version title is complete and accurate
                            </mat-checkbox>
                            <mat-checkbox formControlName="changeChecked">
                              Change description and reason for change are complete
                            </mat-checkbox>
                            <mat-checkbox [checked]="hasBpmnAsset()" disabled>
                              BPMN diagram is attached
                            </mat-checkbox>
                            <mat-checkbox formControlName="requirementsChecked">
                              Stakeholder and process-owner requirements are captured
                            </mat-checkbox>
                          </form>
                          <p class="muted">
                            Checklist progress: {{ allChecklistChecked() ? 'Ready for submission' : 'Still incomplete' }}
                          </p>
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
                      <form [formGroup]="uploadForm" (ngSubmit)="uploadAsset()">
                        <mat-form-field appearance="outline">
                          <mat-label>Caption</mat-label>
                          <input matInput formControlName="caption" />
                        </mat-form-field>

                        <input type="file" accept=".bpmn,.xml,text/xml,application/xml" (change)="onFileSelected($event)" />

                        @if (selectedFileName(); as selectedFileName) {
                          <p class="muted">Selected file: {{ selectedFileName }}</p>
                        }

                        @if (uploadErrorMessage(); as uploadErrorMessage) {
                          <p class="error-message">{{ uploadErrorMessage }}</p>
                        }

                        <div class="card-actions">
                          <button mat-flat-button color="primary" type="submit" [disabled]="isUploading()">
                            <mat-icon>upload_file</mat-icon>
                            Upload BPMN
                          </button>
                        </div>
                      </form>

                      <mat-divider style="margin: 1rem 0;"></mat-divider>
                    }

                    @if (assets().length === 0) {
                      <p class="muted">No BPMN assets uploaded yet.</p>
                    } @else {
                      <div class="history-list">
                        @for (asset of assets(); track asset.id; let last = $last) {
                          <div [style]="last ? 'padding: 1rem 0;' : 'padding: 1rem 0; border-bottom: 1px solid var(--portal-border);'">
                            <div class="section-header">
                              <div>
                                <strong>{{ asset.caption }}</strong>
                                <p class="muted">{{ asset.mimeType }} - {{ asset.sizeBytes }} bytes</p>
                              </div>
                              <button mat-button type="button" (click)="viewAsset(asset)">
                                <mat-icon>visibility</mat-icon>
                                View XML
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    }

                    @if (selectedAssetContent(); as selectedAssetContent) {
                      <div style="margin-top: 1rem;">
                        <h3>{{ selectedAssetContent.caption }}</h3>
                        <pre class="bo-xml-preview">{{ selectedAssetContent.content }}</pre>
                      </div>
                    }
                  </mat-card-content>
                </mat-card>
              </div>
            } @else if (selectedTab() === 'procedures') {
              <div class="detail-frame__body">
                <mat-card appearance="outlined">
                  <mat-card-content>
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
  private readonly accessControl = inject(AccessControlUtil);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breadcrumbOwner = Symbol('version-detail-page');

  protected readonly version = signal<ProcessVersionRecord | null>(null);
  protected readonly process = signal<ProcessRecord | null>(null);
  protected readonly relatedVersions = signal<ProcessVersionRecord[]>([]);
  protected readonly assets = signal<AssetRecord[]>([]);
  protected readonly procedures = signal<ProcedureRecord[]>([]);
  protected readonly selectedAssetContent = signal<AssetContentRecord | null>(null);
  protected readonly stateHistory = signal<VersionStateHistoryRecord[]>([]);
  protected readonly auditLogs = signal<AuditLogRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSavingDraft = signal(false);
  protected readonly isActing = signal(false);
  protected readonly isUploading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly draftErrorMessage = signal<string | null>(null);
  protected readonly actionErrorMessage = signal<string | null>(null);
  protected readonly uploadErrorMessage = signal<string | null>(null);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly selectedTab = signal<VersionDetailTabId>('summary');
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

    return getVisibleLifecycleActions(role, this.version());
  });
  protected readonly canEditDraft = computed(() => this.editorCanManageVersion());
  protected readonly canUploadBpmn = computed(() => this.editorCanManageVersion());
  protected readonly canShowChecklist = computed(() => this.canEditDraft());
  protected readonly tabs = computed(() => {
    const tabs: { id: VersionDetailTabId; label: string }[] = [
      { id: 'summary', label: 'Summary' },
    ];

    tabs.push({ id: 'work', label: 'Work' });

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
  protected readonly allChecklistChecked = computed(
    () =>
      this.checklistForm.controls.titleChecked.getRawValue() &&
      this.checklistForm.controls.changeChecked.getRawValue() &&
      this.checklistForm.controls.requirementsChecked.getRawValue() &&
      this.hasBpmnAsset(),
  );
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
        return 'Use this evidence to validate the draft and record your review decision.';
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
  });

  protected readonly uploadForm = this.fb.group({
    caption: ['', [Validators.required]],
  });

  protected readonly actionForm = this.fb.group({
    reason: [''],
    promotionTitle: [''],
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

  protected async viewAsset(asset: AssetRecord): Promise<void> {
    try {
      this.selectedAssetContent.set(
        await firstValueFrom(this.api.getAssetContent(asset.processVersionId, asset.id)),
      );
    } catch (error) {
      this.uploadErrorMessage.set(
        getHttpErrorMessage(error, 'Unable to load the BPMN asset preview.'),
      );
    }
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
              'Complete the submission checklist and attach a BPMN file before submitting.',
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

    if (!assets.some((asset) => asset.id === this.selectedAssetContent()?.id)) {
      this.selectedAssetContent.set(null);
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

    this.checklistForm.reset({
      titleChecked: version.checklistCompleted,
      changeChecked: version.checklistCompleted,
      requirementsChecked: version.checklistCompleted,
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
        return 'Approve or reject the version.';
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
          checklistCompleted: this.allChecklistChecked(),
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
