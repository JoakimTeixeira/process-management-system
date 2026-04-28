import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { BreadcrumbService } from '../../core/navigation/breadcrumb.service';
import { VersionDetailPageComponent } from './version-detail.page';

interface VersionDetailPageTestInstance {
  version: VersionDetailPageComponent['version'];
  draftForm: VersionDetailPageComponent['draftForm'];
  checklistForm: VersionDetailPageComponent['checklistForm'];
  uploadForm: VersionDetailPageComponent['uploadForm'];
  selectedFile: VersionDetailPageComponent['selectedFile'];
  previewAssetContent: VersionDetailPageComponent['previewAssetContent'];
  expandedPreviewAssetId: VersionDetailPageComponent['expandedPreviewAssetId'];
  expandedAssetXmlId: VersionDetailPageComponent['expandedAssetXmlId'];
  assetTimeline: VersionDetailPageComponent['assetTimeline'];
  allChecklistChecked: VersionDetailPageComponent['allChecklistChecked'];
  relatedVersions: VersionDetailPageComponent['relatedVersions'];
  assets: VersionDetailPageComponent['assets'];
  procedures: VersionDetailPageComponent['procedures'];
  procedureForm: VersionDetailPageComponent['procedureForm'];
  canEditDraft: VersionDetailPageComponent['canEditDraft'];
  canUploadBpmn: VersionDetailPageComponent['canUploadBpmn'];
  visibleActions: VersionDetailPageComponent['visibleActions'];
  waitingForRoleLabel: VersionDetailPageComponent['waitingForRoleLabel'];
  nextActionLabel: VersionDetailPageComponent['nextActionLabel'];
  nextChecklistItem: VersionDetailPageComponent['nextChecklistItem'];
  nextChecklistCompleteLabel: VersionDetailPageComponent['nextChecklistCompleteLabel'];
  selectTab: VersionDetailPageComponent['selectTab'];
  uploadAsset: VersionDetailPageComponent['uploadAsset'];
  toggleAssetPreview: VersionDetailPageComponent['toggleAssetPreview'];
  previewAssetRevision: VersionDetailPageComponent['previewAssetRevision'];
  toggleAssetXml: VersionDetailPageComponent['toggleAssetXml'];
  getAssetRevisionLabel: VersionDetailPageComponent['getAssetRevisionLabel'];
  getAssetMimeTypeLabel: VersionDetailPageComponent['getAssetMimeTypeLabel'];
  saveDraft: VersionDetailPageComponent['saveDraft'];
  saveProcedure: VersionDetailPageComponent['saveProcedure'];
  startEditingProcedure: VersionDetailPageComponent['startEditingProcedure'];
  addProcedureActivity: VersionDetailPageComponent['addProcedureActivity'];
  procedureActivities: VersionDetailPageComponent['procedureActivities'];
}

describe('VersionDetailPageComponent', () => {
  let api: jasmine.SpyObj<BackofficeApiService>;
  let auth: {
    hasRole: jasmine.Spy;
    currentUser: () => {
      id: string;
      name: string;
      email: string;
      role: { id: string; name: 'EDITOR' | 'REVIEWER' | 'PUBLISHER' };
      team: { id: string; code: string; name: string };
    };
  };

  beforeEach(async () => {
    api = jasmine.createSpyObj<BackofficeApiService>('BackofficeApiService', [
      'getVersion',
      'getProcess',
      'listProcessVersions',
      'listAssets',
      'listProcedures',
      'createProcedure',
      'updateProcedure',
      'deleteProcedure',
      'getVersionStateHistory',
      'getAuditLogs',
      'updateVersion',
      'uploadBpmnAsset',
      'getAssetContent',
      'submitVersionForReview',
      'approveVersion',
      'rejectVersion',
      'reopenVersion',
      'publishVersion',
      'archiveVersion',
      'promoteVersion',
    ]);

    api.getVersion.and.returnValue(
      of({
        id: 'version-1',
        processId: 'process-1',
        versionNumber: 2,
        lifecycleState: 'Draft',
        architectureState: 'TO-BE',
        title: 'Future process',
        checklistCompleted: false,
        derivedFromVersionId: 'version-0',
        changeDescription: 'Draft change',
        reasonForChange: 'Business request',
      }),
    );
    api.getProcess.and.returnValue(
      of({
        id: 'process-1',
        areaId: 'area-1',
        code: 'P1',
        title: 'Change control',
        description: 'Process description',
        teamId: 'team-1',
        teamName: 'Operations',
        ownerId: 'owner-1',
        ownerName: 'Alice Owner',
      }),
    );
    api.listProcessVersions.and.returnValue(
      of([
        {
          id: 'version-0',
          processId: 'process-1',
          versionNumber: 1,
          lifecycleState: 'Published',
          architectureState: 'AS-IS',
          title: 'Current process',
          checklistCompleted: true,
          derivedFromVersionId: null,
          changeDescription: 'Live',
          reasonForChange: 'Published',
        },
        {
          id: 'version-1',
          processId: 'process-1',
          versionNumber: 2,
          lifecycleState: 'Draft',
          architectureState: 'TO-BE',
          title: 'Future process',
          checklistCompleted: false,
          derivedFromVersionId: 'version-0',
          changeDescription: 'Draft change',
          reasonForChange: 'Business request',
        },
      ]),
    );
    api.listAssets.and.returnValue(
      of([
        {
          id: 'asset-1',
          processVersionId: 'version-1',
          caption: 'Draft BPMN',
          assetType: 'BPMN',
          filePath: 'uploads/backoffice/bpmn/file.bpmn',
          mimeType: 'application/xml',
          checksum: 'abc',
          sizeBytes: 123,
          isCurrent: true,
          supersededAt: null,
          supersededByAssetId: null,
          createdAt: '2026-04-28T12:00:00.000Z',
        },
      ]),
    );
    api.listProcedures.and.returnValue(of([]));
    api.getAssetContent.and.returnValue(
      of({
        id: 'asset-1',
        caption: 'Draft BPMN',
        filePath: 'uploads/backoffice/bpmn/file.bpmn',
        mimeType: 'application/xml',
        content: '<?xml version="1.0"?><definitions><process id="p1" /></definitions>',
      }),
    );
    api.getVersionStateHistory.and.returnValue(of([]));
    api.getAuditLogs.and.returnValue(of([]));

    auth = {
      hasRole: jasmine.createSpy('hasRole').and.callFake((role: string) => role === 'EDITOR'),
      currentUser: () => ({
        id: 'editor-1',
        name: 'Eve Editor',
        email: 'eve@example.com',
        role: { id: 'role-1', name: 'EDITOR' },
        team: { id: 'team-1', code: 'OPS', name: 'Operations' },
      }),
    };

    await TestBed.configureTestingModule({
      imports: [VersionDetailPageComponent],
      providers: [
        { provide: BackofficeApiService, useValue: api },
        { provide: AuthService, useValue: auth },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('should load version workflow state and derive functional action data', async () => {
    const fixture = TestBed.createComponent(VersionDetailPageComponent);

    fixture.componentRef.setInput('id', 'version-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as VersionDetailPageTestInstance;

    expect(api.getVersion).toHaveBeenCalledWith('version-1');
    expect(component.draftForm.getRawValue()).toEqual({
      architectureState: 'TO-BE',
      title: 'Future process',
      derivedFromVersionId: 'version-0',
      changeDescription: 'Draft change',
      reasonForChange: 'Business request',
    });
    expect(component.relatedVersions().map((version: { id: string }) => version.id)).toEqual([
      'version-0',
      'version-1',
    ]);
    expect(component.assets().length).toBe(1);
    expect(component.expandedPreviewAssetId()).toBe('asset-1');
    expect(component.previewAssetContent()?.id).toBe('asset-1');
    expect(component.canEditDraft()).toBeTrue();
    expect(component.canUploadBpmn()).toBeTrue();
    expect(component.visibleActions().map((action: { key: string }) => action.key)).toEqual([
      'submit',
    ]);
    expect(component.waitingForRoleLabel()).toBe('EDITOR');
    expect(component.nextActionLabel()).toBe('Complete the draft and submit it for review.');
    expect(TestBed.inject(BreadcrumbService).items()).toEqual([
      { label: 'Processes', url: '/processes' },
      { label: 'Change control' },
      { label: 'Versions', url: '/processes/process-1/versions' },
      { label: 'v2' },
      { label: 'Edit draft' },
    ]);
  });

  it('should hide editor mutation actions when the version belongs to another team', async () => {
    auth.currentUser = () => ({
      id: 'editor-1',
      name: 'Eve Editor',
      email: 'eve@example.com',
      role: { id: 'role-1', name: 'EDITOR' },
      team: { id: 'team-2', code: 'FIN', name: 'Finance' },
    });

    const fixture = TestBed.createComponent(VersionDetailPageComponent);
    fixture.componentRef.setInput('id', 'version-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as VersionDetailPageTestInstance;

    expect(component.canEditDraft()).toBeFalse();
    expect(component.canUploadBpmn()).toBeFalse();
    expect(component.visibleActions()).toEqual([]);
  });

  it('should update the breadcrumb trail when the selected tab changes', async () => {
    const fixture = TestBed.createComponent(VersionDetailPageComponent);

    fixture.componentRef.setInput('id', 'version-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as VersionDetailPageTestInstance;

    component.selectTab('diagram');
    fixture.detectChanges();

    expect(TestBed.inject(BreadcrumbService).items()).toEqual([
      { label: 'Processes', url: '/processes' },
      { label: 'Change control' },
      { label: 'Versions', url: '/processes/process-1/versions' },
      { label: 'v2' },
      { label: 'Diagram' },
    ]);
  });

  it('should save draft metadata without updating reviewer checklist status', async () => {
    api.listAssets.and.returnValue(of([]));
    api.updateVersion.and.returnValue(
      of({
        id: 'version-1',
        processId: 'process-1',
        versionNumber: 2,
        lifecycleState: 'Draft',
        architectureState: 'TO-BE',
        title: 'Future process',
        checklistCompleted: false,
        derivedFromVersionId: 'version-0',
        changeDescription: 'Draft change',
        reasonForChange: 'Business request',
      }),
    );

    const fixture = TestBed.createComponent(VersionDetailPageComponent);
    fixture.componentRef.setInput('id', 'version-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as VersionDetailPageTestInstance;

    await component.saveDraft();
    fixture.detectChanges();

    expect(api.updateVersion).toHaveBeenCalledWith('version-1', {
      architectureState: 'TO-BE',
      title: 'Future process',
      derivedFromVersionId: 'version-0',
      changeDescription: 'Draft change',
      reasonForChange: 'Business request',
    });
  });

  it('should recompute submission readiness immediately when supporting records change', async () => {
    const fixture = TestBed.createComponent(VersionDetailPageComponent);
    fixture.componentRef.setInput('id', 'version-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as VersionDetailPageTestInstance;

    expect(component.allChecklistChecked()).toBeFalse();

    component.procedures.set([
      {
        id: 'procedure-1',
        processVersionId: 'version-1',
        code: 'P1.1',
        title: 'Validate request',
        utility: 'Ensure the request is complete',
        warranty: 'Consistent intake',
        outcome: 'Validated request',
        policy: 'Follow intake policy',
        activities: [],
        inputs: ['Request form'],
        outputs: ['Validated request'],
      },
    ]);
    fixture.detectChanges();

    expect(component.allChecklistChecked()).toBeTrue();
  });

  it('should guide draft users to the next missing submission step', async () => {
    const fixture = TestBed.createComponent(VersionDetailPageComponent);
    fixture.componentRef.setInput('id', 'version-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as VersionDetailPageTestInstance;

    expect(component.nextChecklistItem()?.label).toBe('Add at least 1 procedure');
  });

  it('should use a reviewer checklist for correctness checks', async () => {
    auth.hasRole.and.callFake((role: string) => role === 'REVIEWER');
    auth.currentUser = () => ({
      id: 'reviewer-1',
      name: 'Rita Reviewer',
      email: 'rita@example.com',
      role: { id: 'role-2', name: 'REVIEWER' },
      team: { id: 'team-1', code: 'OPS', name: 'Operations' },
    });
    api.getVersion.and.returnValue(
      of({
        id: 'version-1',
        processId: 'process-1',
        versionNumber: 2,
        lifecycleState: 'In Review',
        architectureState: 'TO-BE',
        title: 'Future process',
        checklistCompleted: false,
        derivedFromVersionId: 'version-0',
        changeDescription: 'Draft change',
        reasonForChange: 'Business request',
      }),
    );
    api.listProcedures.and.returnValue(
      of([
        {
          id: 'procedure-1',
          processVersionId: 'version-1',
          code: 'P1.1',
          title: 'Validate request',
          utility: 'Ensure the request is complete',
          warranty: 'Consistent intake',
          outcome: 'Validated request',
          policy: 'Follow intake policy',
          activities: [],
          inputs: ['Request form'],
          outputs: ['Validated request'],
        },
      ]),
    );

    const fixture = TestBed.createComponent(VersionDetailPageComponent);
    fixture.componentRef.setInput('id', 'version-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as VersionDetailPageTestInstance;

    expect(component.nextChecklistItem()?.label).toBe('Confirm the title is correct');
    expect(component.allChecklistChecked()).toBeFalse();

    component.checklistForm.setValue({
      titleChecked: true,
      changeChecked: true,
      requirementsChecked: true,
      architectureChecked: true,
      diagramProceduresChecked: true,
    });
    fixture.detectChanges();

    expect(component.allChecklistChecked()).toBeTrue();
  });

  it('should give publishers a concrete publish instruction when no guided checklist step remains', async () => {
    auth.hasRole.and.callFake((role: string) => role === 'PUBLISHER');
    auth.currentUser = () => ({
      id: 'publisher-1',
      name: 'Pat Publisher',
      email: 'pat@example.com',
      role: { id: 'role-3', name: 'PUBLISHER' },
      team: { id: 'team-1', code: 'OPS', name: 'Operations' },
    });
    api.getVersion.and.returnValue(
      of({
        id: 'version-1',
        processId: 'process-1',
        versionNumber: 2,
        lifecycleState: 'Approved',
        architectureState: 'TO-BE',
        title: 'Future process',
        checklistCompleted: true,
        derivedFromVersionId: 'version-0',
        changeDescription: 'Draft change',
        reasonForChange: 'Business request',
      }),
    );
    api.listProcedures.and.returnValue(
      of([
        {
          id: 'procedure-1',
          processVersionId: 'version-1',
          code: 'P1.1',
          title: 'Validate request',
          utility: 'Ensure the request is complete',
          warranty: 'Consistent intake',
          outcome: 'Validated request',
          policy: 'Follow intake policy',
          activities: [],
          inputs: ['Request form'],
          outputs: ['Validated request'],
        },
      ]),
    );

    const fixture = TestBed.createComponent(VersionDetailPageComponent);
    fixture.componentRef.setInput('id', 'version-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as VersionDetailPageTestInstance;

    expect(component.nextChecklistItem()).toBeNull();
    expect(component.nextChecklistCompleteLabel()).toBe(
      'Verify it is ready for publishing, then click Publish.',
    );
  });

  it('should sync the version checklist after superseding a BPMN asset without resetting unsaved draft fields', async () => {
    api.listAssets.and.returnValues(
      of([
        {
          id: 'asset-1',
          processVersionId: 'version-1',
          caption: 'Draft BPMN',
          assetType: 'BPMN',
          filePath: 'uploads/backoffice/bpmn/file.bpmn',
          mimeType: 'application/xml',
          checksum: 'abc',
          sizeBytes: 123,
          isCurrent: true,
          supersededAt: null,
          supersededByAssetId: null,
          createdAt: '2026-04-28T12:00:00.000Z',
        },
      ]),
      of([
        {
          id: 'asset-1',
          processVersionId: 'version-1',
          caption: 'Draft BPMN',
          assetType: 'BPMN',
          filePath: 'uploads/backoffice/bpmn/file.bpmn',
          mimeType: 'application/xml',
          checksum: 'abc',
          sizeBytes: 123,
          isCurrent: false,
          supersededAt: '2026-04-28T12:00:00.000Z',
          supersededByAssetId: 'asset-2',
          createdAt: '2026-04-28T12:00:00.000Z',
        },
        {
          id: 'asset-2',
          processVersionId: 'version-1',
          caption: 'Updated BPMN',
          assetType: 'BPMN',
          filePath: 'uploads/backoffice/bpmn/file-v2.bpmn',
          mimeType: 'application/xml',
          checksum: 'def',
          sizeBytes: 456,
          isCurrent: true,
          supersededAt: null,
          supersededByAssetId: null,
          createdAt: '2026-04-28T12:05:00.000Z',
        },
      ]),
    );
    api.listProcedures.and.returnValue(
      of([
        {
          id: 'procedure-1',
          processVersionId: 'version-1',
          code: 'P1.1',
          title: 'Validate request',
          utility: 'Ensure the request is complete',
          warranty: 'Consistent intake',
          outcome: 'Validated request',
          policy: 'Follow intake policy',
          activities: [],
          inputs: ['Request form'],
          outputs: ['Validated request'],
        },
      ]),
    );
    api.uploadBpmnAsset.and.returnValue(
      of({
        id: 'asset-2',
        processVersionId: 'version-1',
        caption: 'Updated BPMN',
        assetType: 'BPMN',
        filePath: 'uploads/backoffice/bpmn/file-v2.bpmn',
        mimeType: 'application/xml',
        checksum: 'def',
        sizeBytes: 456,
        isCurrent: true,
        supersededAt: null,
        supersededByAssetId: null,
        createdAt: '2026-04-28T12:05:00.000Z',
      }),
    );
    api.getAssetContent.and.callFake((processVersionId: string, assetId: string) =>
      of({
        id: assetId,
        caption: assetId === 'asset-2' ? 'Updated BPMN' : 'Draft BPMN',
        filePath:
          assetId === 'asset-2'
            ? 'uploads/backoffice/bpmn/file-v2.bpmn'
            : 'uploads/backoffice/bpmn/file.bpmn',
        mimeType: 'application/xml',
        content: `<?xml version="1.0"?><definitions><process id="${assetId}" /></definitions>`,
      }),
    );
    api.updateVersion.and.returnValue(
      of({
        id: 'version-1',
        processId: 'process-1',
        versionNumber: 2,
        lifecycleState: 'Draft',
        architectureState: 'TO-BE',
        title: 'Future process',
        checklistCompleted: true,
        derivedFromVersionId: 'version-0',
        changeDescription: 'Draft change',
        reasonForChange: 'Business request',
      }),
    );

    const fixture = TestBed.createComponent(VersionDetailPageComponent);
    fixture.componentRef.setInput('id', 'version-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as VersionDetailPageTestInstance;
    component.draftForm.controls.title.setValue('Unsaved title change');
    component.uploadForm.setValue({ caption: 'Updated BPMN' });
    component.selectedFile.set(
      new File(['<?xml version="1.0"?><definitions><process id="p1" /></definitions>'], 'diagram-v2.bpmn', {
        type: 'application/xml',
      }),
    );

    await component.uploadAsset();

    expect(api.uploadBpmnAsset).toHaveBeenCalledWith(
      'version-1',
      'Updated BPMN',
      jasmine.any(File),
    );
    expect(api.updateVersion).not.toHaveBeenCalled();
    expect(component.draftForm.controls.title.getRawValue()).toBe('Unsaved title change');
    expect(component.assets().map((asset: { id: string; isCurrent: boolean }) => ({
      id: asset.id,
      isCurrent: asset.isCurrent,
    }))).toEqual([
      { id: 'asset-1', isCurrent: false },
      { id: 'asset-2', isCurrent: true },
    ]);
  });

  it('should assign readable revision labels and normalize octet-stream BPMN metadata', async () => {
    api.listAssets.and.returnValue(
      of([
        {
          id: 'asset-1',
          processVersionId: 'version-1',
          caption: 'Original BPMN',
          assetType: 'BPMN',
          filePath: 'uploads/backoffice/bpmn/file-v1.bpmn',
          mimeType: 'application/octet-stream',
          checksum: 'abc',
          sizeBytes: 123,
          isCurrent: false,
          supersededAt: '2026-04-28T12:10:00.000Z',
          supersededByAssetId: 'asset-2',
          createdAt: '2026-04-28T12:00:00.000Z',
        },
        {
          id: 'asset-2',
          processVersionId: 'version-1',
          caption: 'Revised BPMN',
          assetType: 'BPMN',
          filePath: 'uploads/backoffice/bpmn/file-v2.bpmn',
          mimeType: 'application/xml',
          checksum: 'def',
          sizeBytes: 456,
          isCurrent: true,
          supersededAt: null,
          supersededByAssetId: null,
          createdAt: '2026-04-28T12:10:00.000Z',
        },
      ]),
    );
    api.getAssetContent.and.callFake((processVersionId: string, assetId: string) =>
      of({
        id: assetId,
        caption: assetId === 'asset-2' ? 'Revised BPMN' : 'Original BPMN',
        filePath: `uploads/backoffice/bpmn/${assetId}.bpmn`,
        mimeType: 'application/xml',
        content: `<?xml version="1.0"?><definitions><process id="${assetId}" /></definitions>`,
      }),
    );

    const fixture = TestBed.createComponent(VersionDetailPageComponent);
    fixture.componentRef.setInput('id', 'version-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as VersionDetailPageTestInstance;

    expect(component.assetTimeline().map((asset: { id: string }) => asset.id)).toEqual([
      'asset-2',
      'asset-1',
    ]);
    expect(component.getAssetRevisionLabel(component.assets()[0])).toBe('v1');
    expect(component.getAssetRevisionLabel(component.assets()[1])).toBe('v2');
    expect(component.getAssetMimeTypeLabel(component.assets()[0])).toBe('application/xml');
  });

  it('should open the current preview by default and switch the expanded preview like an accordion', async () => {
    api.listAssets.and.returnValue(
      of([
        {
          id: 'asset-1',
          processVersionId: 'version-1',
          caption: 'Original BPMN',
          assetType: 'BPMN',
          filePath: 'uploads/backoffice/bpmn/file-v1.bpmn',
          mimeType: 'application/xml',
          checksum: 'abc',
          sizeBytes: 123,
          isCurrent: false,
          supersededAt: '2026-04-28T12:10:00.000Z',
          supersededByAssetId: 'asset-2',
          createdAt: '2026-04-28T12:00:00.000Z',
        },
        {
          id: 'asset-2',
          processVersionId: 'version-1',
          caption: 'Current BPMN',
          assetType: 'BPMN',
          filePath: 'uploads/backoffice/bpmn/file-v2.bpmn',
          mimeType: 'application/xml',
          checksum: 'def',
          sizeBytes: 456,
          isCurrent: true,
          supersededAt: null,
          supersededByAssetId: null,
          createdAt: '2026-04-28T12:10:00.000Z',
        },
      ]),
    );
    api.getAssetContent.and.callFake((processVersionId: string, assetId: string) =>
      of({
        id: assetId,
        caption: assetId === 'asset-2' ? 'Current BPMN' : 'Original BPMN',
        filePath: `uploads/backoffice/bpmn/${assetId}.bpmn`,
        mimeType: 'application/xml',
        content: `<?xml version="1.0"?><definitions><process id="${assetId}" /></definitions>`,
      }),
    );

    const fixture = TestBed.createComponent(VersionDetailPageComponent);
    fixture.componentRef.setInput('id', 'version-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as VersionDetailPageTestInstance;

    expect(component.expandedPreviewAssetId()).toBe('asset-2');
    expect(component.previewAssetContent()?.id).toBe('asset-2');

    await component.toggleAssetPreview(component.assets()[0]);
    expect(component.expandedPreviewAssetId()).toBe('asset-1');
    expect(component.previewAssetContent()?.id).toBe('asset-1');
  });

  it('should toggle BPMN XML open and closed when the same asset button is clicked twice', async () => {
    const fixture = TestBed.createComponent(VersionDetailPageComponent);
    fixture.componentRef.setInput('id', 'version-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as VersionDetailPageTestInstance;
    const asset = component.assets()[0];

    await component.toggleAssetXml(asset);
    expect(component.expandedAssetXmlId()).toBe('asset-1');
    expect(component.previewAssetContent()?.id).toBe('asset-1');

    await component.toggleAssetXml(asset);
    expect(component.expandedAssetXmlId()).toBeNull();
    expect(component.previewAssetContent()?.id).toBe('asset-1');
  });

  it('should create procedures from the draft workspace', async () => {
    api.createProcedure.and.returnValue(
      of({
        id: 'procedure-1',
        processVersionId: 'version-1',
        code: 'P1.1',
        title: 'Validate request',
        utility: 'Ensure the request is complete',
        warranty: 'Consistent intake',
        outcome: 'Validated request',
        policy: 'Follow intake policy',
        activities: [
          {
            resource: 'Coordinator',
            service_action: 'Validate request',
            work_instruction: 'Check the submission fields',
          },
        ],
        inputs: ['Request form'],
        outputs: ['Validated request'],
      }),
    );
    api.listProcedures.and.returnValues(
      of([]),
      of([
        {
          id: 'procedure-1',
          processVersionId: 'version-1',
          code: 'P1.1',
          title: 'Validate request',
          utility: 'Ensure the request is complete',
          warranty: 'Consistent intake',
          outcome: 'Validated request',
          policy: 'Follow intake policy',
          activities: [
            {
              resource: 'Coordinator',
              service_action: 'Validate request',
              work_instruction: 'Check the submission fields',
            },
          ],
          inputs: ['Request form'],
          outputs: ['Validated request'],
        },
      ]),
    );

    const fixture = TestBed.createComponent(VersionDetailPageComponent);
    fixture.componentRef.setInput('id', 'version-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as VersionDetailPageTestInstance;
    component.procedureForm.patchValue({
      title: 'Validate request',
      utility: 'Ensure the request is complete',
      warranty: 'Consistent intake',
      outcome: 'Validated request',
      policy: 'Follow intake policy',
      inputsText: 'Request form',
      outputsText: 'Validated request',
    });
    component.addProcedureActivity();
    component.procedureActivities().at(0).setValue({
      resource: 'Coordinator',
      serviceAction: 'Validate request',
      workInstruction: 'Check the submission fields',
    });

    await component.saveProcedure();

    expect(api.createProcedure).toHaveBeenCalledWith('version-1', {
      title: 'Validate request',
      utility: 'Ensure the request is complete',
      warranty: 'Consistent intake',
      outcome: 'Validated request',
      policy: 'Follow intake policy',
      activities: [
        {
          resource: 'Coordinator',
          serviceAction: 'Validate request',
          workInstruction: 'Check the submission fields',
        },
      ],
      inputs: ['Request form'],
      outputs: ['Validated request'],
    });
    expect(component.procedures().map((procedure: { id: string }) => procedure.id)).toEqual([
      'procedure-1',
    ]);
  });

  it('should require at least one activity, input, and output before saving a procedure', async () => {
    const fixture = TestBed.createComponent(VersionDetailPageComponent);
    fixture.componentRef.setInput('id', 'version-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as VersionDetailPageTestInstance;
    component.procedureForm.patchValue({
      title: 'Validate request',
      utility: 'Ensure the request is complete',
      warranty: 'Consistent intake',
      outcome: 'Validated request',
      policy: 'Follow intake policy',
      inputsText: '',
      outputsText: '',
    });

    await component.saveProcedure();

    expect(api.createProcedure).not.toHaveBeenCalled();
    expect(component.procedureForm.controls.inputsText.invalid).toBeTrue();
    expect(component.procedureForm.controls.outputsText.invalid).toBeTrue();
    expect(component.procedureActivities().hasError('minItems')).toBeTrue();
  });

  it('should update procedures from the draft workspace', async () => {
    api.listProcedures.and.returnValues(
      of([
        {
          id: 'procedure-1',
          processVersionId: 'version-1',
          code: 'P1.1',
          title: 'Validate request',
          utility: 'Ensure the request is complete',
          warranty: 'Consistent intake',
          outcome: 'Validated request',
          policy: 'Follow intake policy',
          activities: [
            {
              resource: 'Coordinator',
              service_action: 'Validate request',
              work_instruction: 'Check the submission fields',
            },
          ],
          inputs: ['Request form'],
          outputs: ['Validated request'],
        },
      ]),
      of([
        {
          id: 'procedure-1',
          processVersionId: 'version-1',
          code: 'P1.1',
          title: 'Validate and route request',
          utility: 'Ensure the request is complete',
          warranty: 'Consistent intake',
          outcome: 'Validated request',
          policy: 'Follow intake policy',
          activities: [
            {
              resource: 'Coordinator',
              service_action: 'Validate and route request',
              work_instruction: 'Check the submission fields',
            },
          ],
          inputs: ['Request form'],
          outputs: ['Validated request'],
        },
      ]),
    );
    api.updateProcedure.and.returnValue(
      of({
        id: 'procedure-1',
        processVersionId: 'version-1',
        code: 'P1.1',
        title: 'Validate and route request',
        utility: 'Ensure the request is complete',
        warranty: 'Consistent intake',
        outcome: 'Validated request',
        policy: 'Follow intake policy',
        activities: [
          {
            resource: 'Coordinator',
            service_action: 'Validate and route request',
            work_instruction: 'Check the submission fields',
          },
        ],
        inputs: ['Request form'],
        outputs: ['Validated request'],
      }),
    );

    const fixture = TestBed.createComponent(VersionDetailPageComponent);
    fixture.componentRef.setInput('id', 'version-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as VersionDetailPageTestInstance;
    component.startEditingProcedure(component.procedures()[0]);
    component.procedureForm.patchValue({
      title: 'Validate and route request',
    });
    component.procedureActivities().at(0).patchValue({
      serviceAction: 'Validate and route request',
    });

    await component.saveProcedure();

    expect(api.updateProcedure).toHaveBeenCalledWith(
      'procedure-1',
      jasmine.objectContaining({
        title: 'Validate and route request',
        activities: [
          jasmine.objectContaining({
            serviceAction: 'Validate and route request',
          }),
        ],
      }),
    );
  });
});
