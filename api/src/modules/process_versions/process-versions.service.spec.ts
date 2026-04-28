import { ConflictException, ForbiddenException } from '@nestjs/common';
import type { DataSource } from 'typeorm';

import { ProcessVersionAction } from '../../common/enums/process-version-action.enum';
import { Role } from '../../common/enums/role.enum';
import type { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { ProcessesRepository } from '../processes/processes.repository';
import type { WorkflowAuthorizationService } from '../workflow_support/workflow-authorization.service';
import type { ProcessVersionsRepository } from './process-versions.repository';
import { ProcessVersionsService } from './process-versions.service';

describe('ProcessVersionsService', () => {
  let dataSource: jest.Mocked<Pick<DataSource, 'transaction' | 'query'>>;
  let processesRepository: jest.Mocked<Pick<ProcessesRepository, 'findById'>>;
  let processVersionsRepository: jest.Mocked<
    Pick<
      ProcessVersionsRepository,
      | 'countBpmnAssets'
      | 'create'
      | 'delete'
      | 'findById'
      | 'findByProcessId'
      | 'findByProcessAndVersionNumber'
      | 'findLatestActorForState'
      | 'findPublishedVersion'
      | 'getNextVersionNumber'
      | 'insertStateHistory'
      | 'setLifecycleState'
      | 'update'
    >
  >;
  let workflowAuthorizationService: jest.Mocked<
    Pick<
      WorkflowAuthorizationService,
      'assertSameTeamAsProcessOwner' | 'assertSameTeamAsProcessVersionOwner'
    >
  >;
  let auditLogWriterService: jest.Mocked<Pick<AuditLogWriterService, 'create'>>;
  let service: ProcessVersionsService;

  const currentUser: AuthenticatedUser = {
    id: 'publisher-1',
    name: 'Peter Publisher',
    email: 'peter@example.com',
    roleId: 'role-1',
    role: Role.PUBLISHER,
    team: {
      id: 'team-1',
      code: 'HR',
      name: 'Human Resources',
    },
  };

  const approvedVersion = {
    id: 'version-1',
    processId: 'process-1',
    versionNumber: 2,
    lifecycleState: 'Approved',
    architectureState: 'TO-BE',
    title: 'TO-BE version',
    checklistCompleted: true,
    derivedFromVersionId: null,
    changeDescription: 'change',
    reasonForChange: 'reason',
  };

  beforeEach(() => {
    dataSource = {
      query: jest
        .fn()
        .mockImplementation((sql: string) =>
          Promise.resolve(
            sql.includes('SELECT EXISTS') ? [{ exists: true }] : [],
          ),
        ),
      transaction: jest.fn().mockImplementation(
        async (
          runInTransaction: (entityManager: unknown) => Promise<unknown>,
        ) =>
          await runInTransaction({
            query: dataSource.query,
          }),
      ),
    };
    processesRepository = {
      findById: jest.fn(),
    };
    processVersionsRepository = {
      countBpmnAssets: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByProcessId: jest.fn(),
      findByProcessAndVersionNumber: jest.fn(),
      findLatestActorForState: jest.fn(),
      findPublishedVersion: jest.fn(),
      getNextVersionNumber: jest.fn(),
      insertStateHistory: jest.fn(),
      setLifecycleState: jest.fn(),
      update: jest.fn(),
    };
    workflowAuthorizationService = {
      assertSameTeamAsProcessOwner: jest.fn(),
      assertSameTeamAsProcessVersionOwner: jest.fn(),
    };
    auditLogWriterService = {
      create: jest.fn(),
    };
    service = new ProcessVersionsService(
      dataSource as unknown as DataSource,
      processesRepository as unknown as ProcessesRepository,
      processVersionsRepository as unknown as ProcessVersionsRepository,
      workflowAuthorizationService as unknown as WorkflowAuthorizationService,
      auditLogWriterService as unknown as AuditLogWriterService,
    );
  });

  it('should require a BPMN asset before submit for review', async () => {
    processVersionsRepository.findById.mockResolvedValue({
      ...approvedVersion,
      lifecycleState: 'Draft',
    });
    processVersionsRepository.countBpmnAssets.mockResolvedValue(0);

    await expect(
      service.submitForReview(
        'version-1',
        { reason: 'submit' },
        { ...currentUser, role: Role.EDITOR },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should require at least one procedure before submit for review', async () => {
    processVersionsRepository.findById.mockResolvedValue({
      ...approvedVersion,
      lifecycleState: 'Draft',
    });
    processVersionsRepository.countBpmnAssets.mockResolvedValue(1);
    dataSource.query.mockImplementation((sql: string) =>
      Promise.resolve(sql.includes('SELECT EXISTS') ? [{ exists: false }] : []),
    );

    await expect(
      service.submitForReview(
        'version-1',
        { reason: 'submit' },
        { ...currentUser, role: Role.EDITOR },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should reject create when the actor is not an editor', async () => {
    await expect(
      service.create(
        'process-1',
        {
          title: 'Wrong role',
          architectureState: 'TO-BE',
          changeDescription: 'Change',
          reasonForChange: 'Reason',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should reject create when derivedFromVersionId belongs to a different process', async () => {
    processesRepository.findById.mockResolvedValue({
      id: 'process-1',
    } as never);
    processVersionsRepository.findById.mockResolvedValue({
      ...approvedVersion,
      id: 'version-parent',
      processId: 'process-9',
      lifecycleState: 'Published',
    });

    await expect(
      service.create(
        'process-1',
        {
          title: 'Cross-process child',
          architectureState: 'TO-BE',
          changeDescription: 'Change',
          reasonForChange: 'Reason',
          derivedFromVersionId: 'version-parent',
        },
        { ...currentUser, role: Role.EDITOR },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should auto-assign the next version number when creating a version', async () => {
    const createdVersion = {
      ...approvedVersion,
      id: 'version-2',
      versionNumber: 4,
      lifecycleState: 'Draft',
    };

    processesRepository.findById.mockResolvedValue({
      id: 'process-1',
    } as never);
    processVersionsRepository.getNextVersionNumber.mockResolvedValue(4);
    processVersionsRepository.create.mockResolvedValue(createdVersion);
    processVersionsRepository.insertStateHistory.mockResolvedValue(undefined);

    const result = await service.create(
      'process-1',
      {
        title: 'Next Version',
        architectureState: 'TO-BE',
        changeDescription: 'Change',
        reasonForChange: 'Reason',
      },
      { ...currentUser, role: Role.EDITOR },
    );

    expect(processVersionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        processId: 'process-1',
        versionNumber: 4,
        lifecycleState: 'Draft',
        architectureState: 'TO-BE',
        checklistCompleted: false,
      }),
      expect.anything(),
    );
    expect(result.versionNumber).toBe(4);
  });

  it('should reject submit for review when required metadata is missing', async () => {
    processVersionsRepository.findById.mockResolvedValue({
      ...approvedVersion,
      lifecycleState: 'Draft',
      title: '   ',
    });

    await expect(
      service.submitForReview(
        'version-1',
        { reason: 'submit' },
        { ...currentUser, role: Role.EDITOR },
      ),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(processVersionsRepository.countBpmnAssets).not.toHaveBeenCalled();
  });

  it('should reject direct updates outside Draft state', async () => {
    processVersionsRepository.findById.mockResolvedValue({
      ...approvedVersion,
      lifecycleState: 'Published',
    });

    await expect(
      service.update(
        'version-1',
        { title: 'Published changes are forbidden' },
        { ...currentUser, role: Role.EDITOR },
      ),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(processVersionsRepository.update).not.toHaveBeenCalled();
  });

  it('should only advertise editor draft actions for same-team editors', async () => {
    processesRepository.findById.mockResolvedValue({
      id: 'process-1',
      teamId: 'team-1',
    } as never);
    processVersionsRepository.findByProcessId.mockResolvedValue([
      {
        ...approvedVersion,
        lifecycleState: 'Draft',
      },
    ]);

    const ownTeamVersions = await service.listByProcessId('process-1', {
      ...currentUser,
      role: Role.EDITOR,
    });
    const otherTeamVersions = await service.listByProcessId('process-1', {
      ...currentUser,
      role: Role.EDITOR,
      team: {
        id: 'team-9',
        code: 'OPS',
        name: 'Operations',
      },
    });

    expect(ownTeamVersions[0]?.availableActions).toContain(
      ProcessVersionAction.EDIT,
    );
    expect(otherTeamVersions[0]?.availableActions).toEqual([
      ProcessVersionAction.VIEW,
    ]);
  });

  it('should reject update when derivedFromVersionId belongs to a different process', async () => {
    processVersionsRepository.findById
      .mockResolvedValueOnce({
        ...approvedVersion,
        id: 'version-1',
        processId: 'process-1',
        lifecycleState: 'Draft',
      })
      .mockResolvedValueOnce({
        ...approvedVersion,
        id: 'version-parent',
        processId: 'process-9',
        lifecycleState: 'Published',
      });

    await expect(
      service.update(
        'version-1',
        { derivedFromVersionId: 'version-parent' },
        { ...currentUser, role: Role.EDITOR },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should transition rejected versions back to Draft and write history plus audit', async () => {
    const inReviewVersion = {
      ...approvedVersion,
      lifecycleState: 'In Review',
    };
    const rejectedVersion = {
      ...inReviewVersion,
      lifecycleState: 'Draft',
    };

    processVersionsRepository.findById.mockResolvedValue(inReviewVersion);
    processVersionsRepository.setLifecycleState.mockResolvedValue(
      rejectedVersion,
    );
    processVersionsRepository.insertStateHistory.mockResolvedValue(undefined);

    const result = await service.reject(
      'version-1',
      { reason: 'Missing evidence' },
      { ...currentUser, role: Role.REVIEWER },
    );

    expect(result.lifecycleState).toBe('Draft');
    expect(processVersionsRepository.insertStateHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        processVersionId: 'version-1',
        fromState: 'In Review',
        toState: 'Draft',
        actorId: currentUser.id,
        reason: 'Missing evidence',
      }),
      expect.anything(),
    );
    expect(auditLogWriterService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'process_version',
        entityId: 'version-1',
        action: 'REJECT',
        actorId: currentUser.id,
        reasonForChange: 'Missing evidence',
      }),
      expect.anything(),
    );
  });

  it('should transition approved versions back to Draft through reopen and write governance evidence', async () => {
    const reopenedVersion = {
      ...approvedVersion,
      lifecycleState: 'Draft',
    };

    processVersionsRepository.findById.mockResolvedValue(approvedVersion);
    processVersionsRepository.setLifecycleState.mockResolvedValue(
      reopenedVersion,
    );
    processVersionsRepository.insertStateHistory.mockResolvedValue(undefined);

    const result = await service.reopen(
      'version-1',
      { reason: 'Formal rework required' },
      { ...currentUser, role: Role.REVIEWER },
    );

    expect(result.lifecycleState).toBe('Draft');
    expect(processVersionsRepository.insertStateHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        fromState: 'Approved',
        toState: 'Draft',
        reason: 'Formal rework required',
      }),
      expect.anything(),
    );
    expect(auditLogWriterService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'STATE_CHANGE',
        reasonForChange: 'Formal rework required',
      }),
      expect.anything(),
    );
  });

  it('should block publish when the approver and publisher are the same actor', async () => {
    processVersionsRepository.findById.mockResolvedValue(approvedVersion);
    processVersionsRepository.countBpmnAssets.mockResolvedValue(1);
    processVersionsRepository.findLatestActorForState.mockResolvedValue(
      currentUser.id,
    );
    processVersionsRepository.findPublishedVersion.mockResolvedValue(null);

    await expect(
      service.publish('version-1', { reason: 'publish' }, currentUser),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should block publish when checklist completion is missing', async () => {
    processVersionsRepository.findById.mockResolvedValue({
      ...approvedVersion,
      checklistCompleted: false,
    });

    await expect(
      service.publish('version-1', { reason: 'publish' }, currentUser),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(processVersionsRepository.countBpmnAssets).not.toHaveBeenCalled();
  });

  it('should block publish when approval evidence is missing', async () => {
    processVersionsRepository.findById.mockResolvedValue(approvedVersion);
    processVersionsRepository.countBpmnAssets.mockResolvedValue(1);
    processVersionsRepository.findLatestActorForState.mockResolvedValue(null);
    processVersionsRepository.findPublishedVersion.mockResolvedValue(null);

    await expect(
      service.publish('version-1', { reason: 'publish' }, currentUser),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should block publish when no procedure is defined', async () => {
    processVersionsRepository.findById.mockResolvedValue(approvedVersion);
    processVersionsRepository.countBpmnAssets.mockResolvedValue(1);
    dataSource.query.mockImplementation((sql: string) =>
      Promise.resolve(sql.includes('SELECT EXISTS') ? [{ exists: false }] : []),
    );

    await expect(
      service.publish('version-1', { reason: 'publish' }, currentUser),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(
      processVersionsRepository.findLatestActorForState,
    ).not.toHaveBeenCalled();
  });

  it('should publish an approved version and automatically archive the previous published version', async () => {
    const existingPublishedVersion = {
      ...approvedVersion,
      id: 'version-0',
      lifecycleState: 'Published',
    };
    const archivedExistingVersion = {
      ...existingPublishedVersion,
      lifecycleState: 'Archived',
    };
    const publishedVersion = {
      ...approvedVersion,
      lifecycleState: 'Published',
    };

    processVersionsRepository.findById.mockResolvedValue(approvedVersion);
    processVersionsRepository.countBpmnAssets.mockResolvedValue(1);
    processVersionsRepository.findLatestActorForState.mockResolvedValue(
      'reviewer-1',
    );
    processVersionsRepository.findPublishedVersion.mockResolvedValue(
      existingPublishedVersion,
    );
    processVersionsRepository.setLifecycleState
      .mockResolvedValueOnce(archivedExistingVersion)
      .mockResolvedValueOnce(publishedVersion);
    processVersionsRepository.insertStateHistory.mockResolvedValue(undefined);

    const result = await service.publish(
      'version-1',
      { reason: 'Release approved draft' },
      currentUser,
    );

    expect(result.lifecycleState).toBe('Published');
    expect(processVersionsRepository.setLifecycleState).toHaveBeenNthCalledWith(
      1,
      'version-0',
      'Archived',
      currentUser.id,
      expect.anything(),
    );
    expect(processVersionsRepository.setLifecycleState).toHaveBeenNthCalledWith(
      2,
      'version-1',
      'Published',
      currentUser.id,
      expect.anything(),
    );
    expect(
      processVersionsRepository.insertStateHistory,
    ).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        processVersionId: 'version-0',
        fromState: 'Published',
        toState: 'Archived',
      }),
      expect.anything(),
    );
    expect(
      processVersionsRepository.insertStateHistory,
    ).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        processVersionId: 'version-1',
        fromState: 'Approved',
        toState: 'Published',
        reason: 'Release approved draft',
      }),
      expect.anything(),
    );
    expect(auditLogWriterService.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        action: 'ARCHIVE',
        entityId: 'version-0',
      }),
      expect.anything(),
    );
    expect(auditLogWriterService.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        action: 'PUBLISH',
        entityId: 'version-1',
      }),
      expect.anything(),
    );
  });

  it('should reject archive attempts for non-published versions', async () => {
    processVersionsRepository.findById.mockResolvedValue(approvedVersion);

    await expect(
      service.archive('version-1', { reason: 'Invalid archive' }, currentUser),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should archive published versions and write justification to history and audit', async () => {
    const publishedVersion = {
      ...approvedVersion,
      lifecycleState: 'Published',
    };
    const archivedVersion = {
      ...publishedVersion,
      lifecycleState: 'Archived',
    };

    processVersionsRepository.findById.mockResolvedValue(publishedVersion);
    processVersionsRepository.setLifecycleState.mockResolvedValue(
      archivedVersion,
    );
    processVersionsRepository.insertStateHistory.mockResolvedValue(undefined);

    const result = await service.archive(
      'version-1',
      { reason: 'Superseded by a newer release' },
      currentUser,
    );

    expect(result.lifecycleState).toBe('Archived');
    expect(processVersionsRepository.insertStateHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        fromState: 'Published',
        toState: 'Archived',
        reason: 'Superseded by a newer release',
      }),
      expect.anything(),
    );
    expect(auditLogWriterService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'ARCHIVE',
        reasonForChange: 'Superseded by a newer release',
      }),
      expect.anything(),
    );
  });

  it('should promote a published TO-BE version into a new published AS-IS version', async () => {
    const sourceVersion = {
      ...approvedVersion,
      id: 'to-be-version',
      lifecycleState: 'Published',
      architectureState: 'TO-BE',
    };
    const existingAsIsVersion = {
      ...approvedVersion,
      id: 'as-is-version',
      lifecycleState: 'Published',
      architectureState: 'AS-IS',
    };
    const promotedVersion = {
      ...sourceVersion,
      id: 'promoted-version',
      versionNumber: 4,
      architectureState: 'AS-IS',
      derivedFromVersionId: sourceVersion.id,
    };

    processVersionsRepository.findById.mockResolvedValue(sourceVersion);
    processVersionsRepository.countBpmnAssets.mockResolvedValue(1);
    processVersionsRepository.findPublishedVersion.mockResolvedValue(
      existingAsIsVersion,
    );
    processVersionsRepository.setLifecycleState
      .mockResolvedValueOnce({
        ...existingAsIsVersion,
        lifecycleState: 'Archived',
      })
      .mockResolvedValueOnce({
        ...sourceVersion,
        lifecycleState: 'Archived',
      });
    processVersionsRepository.getNextVersionNumber.mockResolvedValue(4);
    processVersionsRepository.create.mockResolvedValue(promotedVersion);
    processVersionsRepository.insertStateHistory.mockResolvedValue(undefined);
    dataSource.query.mockImplementation((sql: string) => {
      if (sql.includes('SELECT EXISTS')) {
        return Promise.resolve([{ exists: true }]);
      }

      if (sql.includes('FROM procedures pr')) {
        return Promise.resolve([
          {
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
        ]);
      }

      if (sql.includes('FROM assets a')) {
        return Promise.resolve([
          {
            caption: 'Draft BPMN',
            asset_type: 'BPMN',
            file_path: 'backoffice/bpmn/file.bpmn',
            mime_type: 'application/xml',
            checksum: 'abc',
            size_bytes: 123,
          },
        ]);
      }

      return Promise.resolve([]);
    });

    await service.promote(
      sourceVersion.id,
      { justification: 'TO-BE has been adopted' },
      currentUser,
    );

    expect(processVersionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        processId: sourceVersion.processId,
        versionNumber: 4,
        lifecycleState: 'Published',
        architectureState: 'AS-IS',
        derivedFromVersionId: sourceVersion.id,
        reasonForChange: 'TO-BE has been adopted',
      }),
      expect.anything(),
    );
    expect(processVersionsRepository.insertStateHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        processVersionId: promotedVersion.id,
        fromState: null,
        toState: 'Published',
        actorId: currentUser.id,
      }),
      expect.anything(),
    );
    expect(auditLogWriterService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'process_version',
        entityId: promotedVersion.id,
        action: 'PROMOTE',
        actorId: currentUser.id,
      }),
      expect.anything(),
    );
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO procedures'),
      expect.arrayContaining(['promoted-version']),
    );
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO assets'),
      expect.arrayContaining(['promoted-version']),
    );
  });

  it('should require same-team authorization before approve', async () => {
    const inReviewVersion = {
      ...approvedVersion,
      lifecycleState: 'In Review',
    };

    processVersionsRepository.findById.mockResolvedValue(inReviewVersion);
    workflowAuthorizationService.assertSameTeamAsProcessVersionOwner.mockRejectedValueOnce(
      new ForbiddenException('Forbidden resource'),
    );

    await expect(
      service.approve(
        'version-1',
        { reason: 'approve' },
        {
          ...currentUser,
          role: Role.REVIEWER,
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(
      workflowAuthorizationService.assertSameTeamAsProcessVersionOwner,
    ).toHaveBeenCalledWith('version-1', {
      ...currentUser,
      role: Role.REVIEWER,
    });
  });

  it('should require same-team authorization before publish and promote', async () => {
    const publishedToBeVersion = {
      ...approvedVersion,
      lifecycleState: 'Published',
      architectureState: 'TO-BE',
    };

    processVersionsRepository.findById.mockResolvedValue(publishedToBeVersion);
    workflowAuthorizationService.assertSameTeamAsProcessVersionOwner
      .mockRejectedValueOnce(new ForbiddenException('Forbidden resource'))
      .mockRejectedValueOnce(new ForbiddenException('Forbidden resource'));

    await expect(
      service.publish('version-1', { reason: 'publish' }, currentUser),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.promote(
        'version-1',
        { justification: 'TO-BE has been adopted' },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(
      workflowAuthorizationService.assertSameTeamAsProcessVersionOwner,
    ).toHaveBeenNthCalledWith(1, 'version-1', currentUser);
    expect(
      workflowAuthorizationService.assertSameTeamAsProcessVersionOwner,
    ).toHaveBeenNthCalledWith(2, 'version-1', currentUser);
  });
});
