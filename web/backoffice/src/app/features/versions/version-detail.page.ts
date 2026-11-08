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
  ViewEncapsulation,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  NonNullableFormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
import {
  getAssetMimeTypeLabel,
  getAssetRevisionLabel,
  VersionAssetPanelComponent,
} from './version-asset-panel.component';
import { VersionHistoryPanelComponent } from './version-history-panel.component';
import { VersionLifecyclePanelComponent } from './version-lifecycle-panel.component';
import { VersionProcedurePanelComponent } from './version-procedure-panel.component';

type VersionDetailTabId = 'summary' | 'work' | 'diagram' | 'procedures' | 'history';

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

    return length >= minItems ? null : { minItems: { required: minItems, actual: length } };
  };
}

@Component({
  selector: 'app-version-detail-page',
  imports: [
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    VersionAssetPanelComponent,
    VersionHistoryPanelComponent,
    VersionLifecyclePanelComponent,
    VersionProcedurePanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './version-detail.page.html',
  styleUrl: './version-detail.page.scss',
  encapsulation: ViewEncapsulation.None,
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

  @ViewChild(VersionLifecyclePanelComponent)
  private readonly lifecyclePanel?: VersionLifecyclePanelComponent;

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
      { id: 'work', label: this.primaryActionTabLabel() },
      { id: 'diagram', label: 'Diagram' },
      { id: 'procedures', label: 'Procedures' },
    ];

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
    const previewAssetId = this.expandedPreviewAssetId() ?? this.previewAssetContent()?.id;

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
    reasonForChangePresent: this.draftForm.controls.reasonForChange.getRawValue().trim().length > 0,
    architectureStateSelected: this.architectureStateSelected(),
    hasBpmnAsset: this.hasBpmnAsset(),
    hasProcedure: this.hasProcedure(),
  }));
  protected readonly nextChecklistItem = computed(() => {
    if (this.showReviewChecklist()) {
      const checklistState = this.checklistState();
      const reviewChecklistItems = [
        {
          checked: checklistState.titleChecked,
          label: 'Confirm the title is correct',
          action: () => this.selectTabAndFocus('work', 'title'),
        },
        {
          checked: checklistState.changeChecked,
          label: 'Confirm the change description is correct',
          action: () => this.selectTabAndFocus('work', 'changeDescription'),
        },
        {
          checked: checklistState.requirementsChecked,
          label: 'Confirm the reason for change is correct',
          action: () => this.selectTabAndFocus('work', 'reasonForChange'),
        },
        {
          checked: checklistState.architectureChecked,
          label: 'Confirm the architecture state is correct',
          action: () => this.selectTabAndFocus('work', 'architectureState'),
        },
        {
          checked: checklistState.diagramProceduresChecked,
          label: 'Check that the BPMN diagram reflects the documented procedures',
          action: () => this.selectTab('diagram'),
        },
      ];
      const nextItem = reviewChecklistItems.find((item) => !item.checked);
      return nextItem ? { label: nextItem.label, action: nextItem.action } : null;
    }

    if (!this.canEditDraft()) {
      return null;
    }

    const submissionRequirements = this.submissionRequirements();
    const submissionChecklistItems = [
      {
        present: submissionRequirements.titlePresent,
        label: 'Fill in the title',
        action: () => this.selectTabAndFocus('work', 'title'),
      },
      {
        present: submissionRequirements.changeDescriptionPresent,
        label: 'Fill in the change description',
        action: () => this.selectTabAndFocus('work', 'changeDescription'),
      },
      {
        present: submissionRequirements.reasonForChangePresent,
        label: 'Fill in the reason for change',
        action: () => this.selectTabAndFocus('work', 'reasonForChange'),
      },
      {
        present: submissionRequirements.architectureStateSelected,
        label: 'Select the architecture state',
        action: () => this.selectTabAndFocus('work', 'architectureState'),
      },
      {
        present: submissionRequirements.hasBpmnAsset,
        label: 'Upload the BPMN diagram',
        action: () => this.selectTab('diagram'),
      },
      {
        present: submissionRequirements.hasProcedure,
        label: 'Add at least 1 procedure',
        action: () => this.selectTab('procedures'),
      },
    ];
    const nextItem = submissionChecklistItems.find((item) => !item.present);
    return nextItem ? { label: nextItem.label, action: nextItem.action } : null;
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

    if (
      !currentVersion ||
      !activeWorkflowVersion ||
      activeWorkflowVersion?.id !== currentVersion?.id
    ) {
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

    return Boolean(currentRole && waitingForRole !== '-' && waitingForRole === currentRole);
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

    const relatedVersion = this.relatedVersions().find(
      (version) => version.id === derivedFromVersionId,
    );

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
  protected readonly editingProcedure = computed(
    () => this.procedures().find((procedure) => procedure.id === this.editingProcedureId()) ?? null,
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
      this.lifecyclePanel?.focusField(inputId);
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
      this.uploadErrorMessage.set(getHttpErrorMessage(error, 'Unable to upload the BPMN asset.'));
      this.toast.error('Failed to upload BPMN asset');
    } finally {
      this.isUploading.set(false);
    }
  }

  protected getAssetRevisionLabel(asset: AssetRecord): string {
    return getAssetRevisionLabel(asset, this.assets());
  }

  protected getAssetMimeTypeLabel(asset: AssetRecord): string {
    return getAssetMimeTypeLabel(asset);
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
      this.uploadErrorMessage.set(getHttpErrorMessage(error, 'Unable to load the BPMN asset XML.'));
    }
  }

  protected procedureActivities(): FormArray {
    return this.procedureForm.controls.activities;
  }

  protected addProcedureActivity(activity?: Partial<ProcedureActivityFormValue>): void {
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
    this.resetProcedureActivities(this.mapProcedureActivitiesToForm(procedure.activities));
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
      this.procedureErrorMessage.set('Complete the required procedure fields before saving.');
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
      inputs: this.parseProcedureList(this.procedureForm.controls.inputsText.getRawValue()),
      outputs: this.parseProcedureList(this.procedureForm.controls.outputsText.getRawValue()),
    };

    this.isSavingProcedure.set(true);
    this.procedureErrorMessage.set(null);

    try {
      if (this.editingProcedureId()) {
        await firstValueFrom(this.api.updateProcedure(this.editingProcedureId()!, payload));
        this.toast.success('Procedure updated successfully');
      } else {
        await firstValueFrom(this.api.createProcedure(currentVersion.id, payload));
        this.toast.success('Procedure created successfully');
      }

      await this.reloadSupportingData(currentVersion);
      this.cancelProcedureEdit();
    } catch (error) {
      this.procedureErrorMessage.set(getHttpErrorMessage(error, 'Unable to save the procedure.'));
      this.toast.error('Failed to save procedure');
    } finally {
      this.isSavingProcedure.set(false);
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

  private async loadAssetContent(asset: AssetRecord): Promise<AssetContentRecord> {
    const currentPreview = this.previewAssetContent();

    if (currentPreview?.id === asset.id) {
      return currentPreview;
    }

    return await firstValueFrom(this.api.getAssetContent(asset.processVersionId, asset.id));
  }

  private async ensurePreviewAssetContent(assets: AssetRecord[]): Promise<void> {
    if (assets.length === 0) {
      this.previewAssetContent.set(null);
      this.expandedPreviewAssetId.set(null);
      return;
    }

    const currentPreviewId = this.expandedPreviewAssetId() ?? this.previewAssetContent()?.id;
    const assetToPreview =
      (currentPreviewId ? assets.find((asset) => asset.id === currentPreviewId) : null) ??
      assets.find((asset) => asset.isCurrent) ??
      assets.at(-1) ??
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

  private createProcedureActivityGroup(activity?: Partial<ProcedureActivityFormValue>) {
    return this.fb.group({
      resource: [activity?.resource ?? '', [Validators.required]],
      serviceAction: [activity?.serviceAction ?? '', [Validators.required]],
      workInstruction: [activity?.workInstruction ?? '', [Validators.required]],
    });
  }

  private resetProcedureActivities(activities: ProcedureActivityFormValue[] = []): void {
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

  private stringifyProcedureList(items: unknown[] | null | undefined): string {
    return (items ?? [])
      .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
      .join('\n');
  }

  private parseProcedureList(value: string): string[] {
    return value
      .split('\n')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  private readProcedureString(activity: Record<string, unknown>, keys: string[]): string {
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
        this.draftErrorMessage.set(getHttpErrorMessage(error, 'Unable to save the draft changes.'));
        this.toast.error('Failed to save draft');
      }

      throw error;
    } finally {
      this.isSavingDraft.set(false);
    }
  }
}
