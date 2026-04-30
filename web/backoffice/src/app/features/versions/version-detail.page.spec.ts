import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, of, Subject } from 'rxjs';
import { signal, WritableSignal } from '@angular/core';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { VersionDetailPageComponent } from './version-detail.page';

interface VersionDetailPageTestInstance {
  draftForm: VersionDetailPageComponent['draftForm'];
  checklistForm: VersionDetailPageComponent['checklistForm'];
  uploadForm: VersionDetailPageComponent['uploadForm'];
  selectedFile: VersionDetailPageComponent['selectedFile'];
  previewAssetContent: VersionDetailPageComponent['previewAssetContent'];
  expandedPreviewAssetId: VersionDetailPageComponent['expandedPreviewAssetId'];
  assetTimeline: VersionDetailPageComponent['assetTimeline'];
  allChecklistChecked: VersionDetailPageComponent['allChecklistChecked'];
  relatedVersions: VersionDetailPageComponent['relatedVersions'];
  assets: VersionDetailPageComponent['assets'];
  procedures: VersionDetailPageComponent['procedures'];
  canEditDraft: VersionDetailPageComponent['canEditDraft'];
  canUploadBpmn: VersionDetailPageComponent['canUploadBpmn'];
  visibleActions: VersionDetailPageComponent['visibleActions'];
  waitingForRoleLabel: VersionDetailPageComponent['waitingForRoleLabel'];
  nextActionLabel: VersionDetailPageComponent['nextActionLabel'];
  nextChecklistItem: VersionDetailPageComponent['nextChecklistItem'];
  nextChecklistCompleteLabel: VersionDetailPageComponent['nextChecklistCompleteLabel'];
  uploadAsset: VersionDetailPageComponent['uploadAsset'];
  getAssetRevisionLabel: VersionDetailPageComponent['getAssetRevisionLabel'];
  getAssetMimeTypeLabel: VersionDetailPageComponent['getAssetMimeTypeLabel'];
  saveDraft: VersionDetailPageComponent['saveDraft'];
}

type TestRole = 'EDITOR' | 'REVIEWER' | 'PUBLISHER';

interface TestUser {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: TestRole };
  team: { id: string; code: string; name: string };
}

interface TestAuthService {
  currentUser: WritableSignal<TestUser | null>;
  hasRole: jasmine.Spy<(role: string) => boolean>;
}

interface MatDialogTestDouble extends jasmine.SpyObj<MatDialog> {
  _openDialogs: MatDialogRef<unknown>[];
  _afterAllClosed: Observable<void>;
  openDialogs: MatDialogRef<unknown>[];
  afterOpened: Subject<MatDialogRef<unknown>>;
}

describe('VersionDetailPageComponent', () => {
  let api: jasmine.SpyObj<BackofficeApiService>;
  let auth: TestAuthService;
  let dialog: MatDialogTestDouble;

  beforeEach(async () => {
    api = jasmine.createSpyObj<BackofficeApiService>('BackofficeApiService', [
      'getVersion',
      'getProcess',
      'listProcessVersions',
      'listAssets',
      'listProcedures',
      'updateProcedure',
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

    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']) as MatDialogTestDouble;
    dialog.open.and.returnValue({
      afterClosed: () => of(true),
    } as MatDialogRef<unknown>);
    dialog._openDialogs = [];
    dialog._afterAllClosed = of(undefined);
    dialog.openDialogs = [];
    dialog.afterOpened = new Subject<MatDialogRef<unknown>>();

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
      currentUser: signal<TestUser | null>({
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
        { provide: MatDialog, useValue: dialog },
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
    expect(component.relatedVersions().map((version) => version.id)).toEqual([
      'version-0',
      'version-1',
    ]);
    expect(component.assets().length).toBe(1);
    expect(component.expandedPreviewAssetId()).toBe('asset-1');
    expect(component.canEditDraft()).toBeTrue();
    expect(component.canUploadBpmn()).toBeTrue();
    expect(component.visibleActions().map((action) => action.key)).toEqual(['submit']);
    expect(component.waitingForRoleLabel()).toBe('EDITOR');
    expect(component.nextActionLabel()).toBe('Complete the draft and submit it for review.');
  });

  it('should hide editor mutation actions when the version belongs to another team', async () => {
    auth.currentUser.set({
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

  it('should derive the next missing submission requirement for a draft version', async () => {
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
    auth.currentUser.set({
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

  it('should derive the publisher completion state when no checklist requirement is missing', async () => {
    auth.hasRole.and.callFake((role: string) => role === 'PUBLISHER');
    auth.currentUser.set({
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

    api.getAssetContent.and.callFake((_processVersionId: string, assetId: string) =>
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
      new File(
        ['<?xml version="1.0"?><definitions><process id="p1" /></definitions>'],
        'diagram-v2.bpmn',
        { type: 'application/xml' },
      ),
    );

    await component.uploadAsset();

    expect(api.uploadBpmnAsset).toHaveBeenCalledWith(
      'version-1',
      'Updated BPMN',
      jasmine.any(File),
    );
    expect(api.updateVersion).not.toHaveBeenCalled();
    expect(component.draftForm.controls.title.getRawValue()).toBe('Unsaved title change');
    expect(
      component.assets().map((asset) => ({
        id: asset.id,
        isCurrent: asset.isCurrent,
      })),
    ).toEqual([
      { id: 'asset-1', isCurrent: false },
      { id: 'asset-2', isCurrent: true },
    ]);
  });

  it('should derive asset revision order and normalize BPMN mime type metadata', async () => {
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

    api.getAssetContent.and.callFake((_processVersionId: string, assetId: string) =>
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

    expect(component.assetTimeline().map((asset) => asset.id)).toEqual(['asset-2', 'asset-1']);
    expect(component.getAssetRevisionLabel(component.assets()[0])).toBe('v1');
    expect(component.getAssetRevisionLabel(component.assets()[1])).toBe('v2');
    expect(component.getAssetMimeTypeLabel(component.assets()[0])).toBe('application/xml');
  });

  it('should select the current asset as the active preview source by default', async () => {
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

    api.getAssetContent.and.callFake((_processVersionId: string, assetId: string) =>
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
  });
});
