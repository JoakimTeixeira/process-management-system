import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { getBackofficeApiBaseUrl } from './backoffice-api-base-url';
import { BackofficeApiService } from './backoffice-api.service';

describe('BackofficeApiService', () => {
  let service: BackofficeApiService;
  let httpMock: HttpTestingController;
  const baseUrl = getBackofficeApiBaseUrl();

  function expectMethod(url: string, method: string, expectedBody?: unknown): void {
    const req = httpMock.expectOne(`${baseUrl}${url}`);
    expect(req.request.method).toBe(method);
    if (expectedBody !== undefined) {
      expect(req.request.body).toEqual(expectedBody);
    }
    req.flush({});
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BackofficeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call authentication and practice endpoints', () => {
    service.login({ email: 'admin@example.com', password: 'secret' }).subscribe();
    expectMethod('/auth/login', 'POST', { email: 'admin@example.com', password: 'secret' });

    service.getMe().subscribe();
    expectMethod('/auth/me', 'GET');

    service.listItilPractices().subscribe();
    expectMethod('/itil-practices', 'GET');
  });

  it('should call area CRUD endpoints', () => {
    service.listAreas().subscribe();
    expectMethod('/areas', 'GET');

    service.getArea('a1').subscribe();
    expectMethod('/areas/a1', 'GET');

    service
      .createArea({
        title: 'Ops',
        description: 'Desc',
        teamId: 't1',
        ownerId: 'u1',
        itilPracticeId: 'ip1',
      })
      .subscribe();
    expectMethod('/areas', 'POST');

    service.updateArea('a1', { title: 'Updated' }).subscribe();
    expectMethod('/areas/a1', 'PATCH', { title: 'Updated' });

    service.deleteArea('a1').subscribe();
    expectMethod('/areas/a1', 'DELETE');
  });

  it('should call process CRUD endpoints', () => {
    service.listProcesses().subscribe();
    expectMethod('/processes', 'GET');

    service.getProcess('p1').subscribe();
    expectMethod('/processes/p1', 'GET');

    service
      .createProcess({
        title: 'Incident',
        description: 'Desc',
        areaId: 'a1',
        teamId: 't1',
        ownerId: 'u1',
      })
      .subscribe();
    expectMethod('/processes', 'POST');

    service.updateProcess('p1', { title: 'Updated' }).subscribe();
    expectMethod('/processes/p1', 'PATCH', { title: 'Updated' });

    service.deleteProcess('p1').subscribe();
    expectMethod('/processes/p1', 'DELETE');
  });

  it('should call process version CRUD and lifecycle endpoints', () => {
    service.listProcessVersions('p1').subscribe();
    expectMethod('/processes/p1/versions', 'GET');

    service
      .createProcessVersion('p1', {
        architectureState: 'AS-IS',
        title: 'v1',
        changeDescription: 'Initial',
        reasonForChange: 'Baseline',
      })
      .subscribe();
    expectMethod('/processes/p1/versions', 'POST');

    service.getVersion('v1').subscribe();
    expectMethod('/process-versions/v1', 'GET');

    service.updateVersion('v1', { checklistCompleted: true }).subscribe();
    expectMethod('/process-versions/v1', 'PATCH', { checklistCompleted: true });

    service.submitVersionForReview('v1', 'Ready').subscribe();
    expectMethod('/process-versions/v1/submit-for-review', 'POST', { reason: 'Ready' });

    service.submitVersionForReview('v1').subscribe();
    expectMethod('/process-versions/v1/submit-for-review', 'POST', {});

    service.approveVersion('v1', 'Approved').subscribe();
    expectMethod('/process-versions/v1/approve', 'POST', { reason: 'Approved' });

    service.approveVersion('v1').subscribe();
    expectMethod('/process-versions/v1/approve', 'POST', {});

    service.rejectVersion('v1', 'Needs changes').subscribe();
    expectMethod('/process-versions/v1/reject', 'POST', { reason: 'Needs changes' });

    service.reopenVersion('v1', 'Reopen').subscribe();
    expectMethod('/process-versions/v1/reopen', 'POST', { reason: 'Reopen' });

    service.publishVersion('v1', 'Publish now').subscribe();
    expectMethod('/process-versions/v1/publish', 'POST', { reason: 'Publish now' });

    service.publishVersion('v1').subscribe();
    expectMethod('/process-versions/v1/publish', 'POST', {});

    service.archiveVersion('v1', 'Retired').subscribe();
    expectMethod('/process-versions/v1/archive', 'POST', { reason: 'Retired' });

    service.promoteVersion('v1', 'Promote to AS-IS', 'Promoted Title').subscribe();
    expectMethod('/process-versions/v1/promote', 'POST', {
      justification: 'Promote to AS-IS',
      title: 'Promoted Title',
    });

    service.promoteVersion('v1', 'Promote without custom title').subscribe();
    expectMethod('/process-versions/v1/promote', 'POST', {
      justification: 'Promote without custom title',
    });
  });

  it('should call procedure, asset, history, audit, and glossary endpoints', () => {
    service.listAssets('v1').subscribe();
    expectMethod('/process-versions/v1/assets', 'GET');

    service.listProcedures('v1').subscribe();
    expectMethod('/process-versions/v1/procedures', 'GET');

    service
      .createProcedure('v1', {
        title: 'Proc',
        utility: 'Util',
        warranty: 'Warr',
        outcome: 'Out',
        policy: 'Pol',
        activities: [],
        inputs: [],
        outputs: [],
      })
      .subscribe();
    expectMethod('/process-versions/v1/procedures', 'POST');

    service.updateProcedure('pr1', { title: 'Updated' }).subscribe();
    expectMethod('/procedures/pr1', 'PATCH', { title: 'Updated' });

    service.listAllProcedures().subscribe();
    expectMethod('/procedures', 'GET');

    const file = new File(['<definitions />'], 'flow.bpmn', { type: 'application/xml' });
    service.uploadBpmnAsset('v1', 'Main diagram', file).subscribe();
    expectMethod('/process-versions/v1/assets/bpmn', 'POST');

    service.getAssetContent('v1', 'asset1').subscribe();
    expectMethod('/process-versions/v1/assets/asset1/content', 'GET');

    service.getVersionStateHistory('v1').subscribe();
    expectMethod('/process-versions/v1/state-history', 'GET');

    service.getAuditLogs('process_version', 'v1').subscribe();
    expectMethod('/audit-logs/process_version/v1', 'GET');

    service.getGlossary().subscribe();
    expectMethod('/public/glossary', 'GET');

    service
      .createGlossaryTerm({ term: 'SLA', definition: 'Agreement', isPreferred: true })
      .subscribe();
    expectMethod('/glossary', 'POST', {
      term: 'SLA',
      definition: 'Agreement',
      isPreferred: true,
    });

    service.updateGlossaryTerm('g1', { definition: 'Updated' }).subscribe();
    expectMethod('/glossary/g1', 'PATCH', { definition: 'Updated' });
  });

  it('should call user and team administration endpoints', () => {
    service.listOwnerOptions('t1').subscribe();
    expectMethod('/users/owner-options/team/t1', 'GET');

    service.listUsers().subscribe();
    expectMethod('/users', 'GET');

    service.getUser('u1').subscribe();
    expectMethod('/users/u1', 'GET');

    service.listTeamOptions().subscribe();
    expectMethod('/users/team-options', 'GET');

    service.listTeams().subscribe();
    expectMethod('/teams', 'GET');

    service.getTeam('t1').subscribe();
    expectMethod('/teams/t1', 'GET');

    service.createTeam({ code: 'OPS', name: 'Operations', description: 'Ops team' }).subscribe();
    expectMethod('/teams', 'POST', { code: 'OPS', name: 'Operations', description: 'Ops team' });

    service.updateTeam('t1', { name: 'Ops Updated' }).subscribe();
    expectMethod('/teams/t1', 'PATCH', { name: 'Ops Updated' });

    service.deactivateTeam('t1').subscribe();
    expectMethod('/teams/t1/deactivate', 'PATCH', {});

    service
      .createUser({
        name: 'Alice',
        email: 'alice@example.com',
        roleName: 'EDITOR',
        teamId: 't1',
        password: 'password123',
      })
      .subscribe();
    expectMethod('/users', 'POST');

    service.updateUser('u1', { name: 'Alice B' }).subscribe();
    expectMethod('/users/u1', 'PATCH', { name: 'Alice B' });

    service.deactivateUser('u1').subscribe();
    expectMethod('/users/u1/deactivate', 'PATCH', {});

    service.resetUserPassword('u1', 'newPass123').subscribe();
    expectMethod('/users/u1/reset-password', 'PATCH', { newPassword: 'newPass123' });
  });
});
