import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { BreadcrumbService } from '../../core/navigation/breadcrumb.service';
import { VersionDetailPageComponent } from './version-detail.page';

interface VersionDetailPageTestInstance {
  draftForm: VersionDetailPageComponent['draftForm'];
  relatedVersions: VersionDetailPageComponent['relatedVersions'];
  assets: VersionDetailPageComponent['assets'];
  canEditDraft: VersionDetailPageComponent['canEditDraft'];
  canUploadBpmn: VersionDetailPageComponent['canUploadBpmn'];
  visibleActions: VersionDetailPageComponent['visibleActions'];
  waitingForRoleLabel: VersionDetailPageComponent['waitingForRoleLabel'];
  nextActionLabel: VersionDetailPageComponent['nextActionLabel'];
  selectTab: VersionDetailPageComponent['selectTab'];
}

describe('VersionDetailPageComponent', () => {
  let api: jasmine.SpyObj<BackofficeApiService>;
  let auth: {
    hasRole: jasmine.Spy;
    currentUser: () => {
      id: string;
      name: string;
      email: string;
      role: { id: string; name: 'EDITOR' };
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
        },
      ]),
    );
    api.listProcedures.and.returnValue(of([]));
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

  it('loads version workflow state and derives functional action data', async () => {
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
      { label: 'Work' },
    ]);
  });

  it('hides editor mutation actions when the version belongs to another team', async () => {
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

  it('updates the breadcrumb trail when the selected tab changes', async () => {
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
});
