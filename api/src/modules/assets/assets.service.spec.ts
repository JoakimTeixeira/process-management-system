import { readFile } from 'node:fs/promises';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { Role } from '../../common/enums/role.enum';
import { TEST_FILE_SIZE_BYTES_SMALL } from '../../common/constants/workflow.constants';
import type { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { ProcessVersionsRepository } from '../process_versions/process-versions.repository';
import type { WorkflowAuthorizationService } from '../workflow_support/workflow-authorization.service';
import type { AssetsRepository } from './assets.repository';
import { AssetsService } from './assets.service';

jest.mock('node:fs/promises', () => ({
  readFile: jest.fn(),
}));

describe('AssetsService', () => {
  let assetsRepository: jest.Mocked<
    Pick<AssetsRepository, 'createBpmnAsset' | 'findByProcessVersionId'>
  >;
  let processVersionsRepository: jest.Mocked<
    Pick<ProcessVersionsRepository, 'findById'>
  >;
  let workflowAuthorizationService: jest.Mocked<
    Pick<WorkflowAuthorizationService, 'assertSameTeamAsProcessVersionOwner'>
  >;
  let auditLogWriterService: jest.Mocked<Pick<AuditLogWriterService, 'create'>>;
  let service: AssetsService;

  const currentUser: AuthenticatedUser = {
    id: 'user-1',
    name: 'Alice Editor',
    email: 'alice@example.com',
    roleId: 'role-1',
    role: Role.EDITOR,
    team: {
      id: 'team-1',
      code: 'HR',
      name: 'Human Resources',
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    assetsRepository = {
      createBpmnAsset: jest.fn(),
      findByProcessVersionId: jest.fn(),
    };
    processVersionsRepository = {
      findById: jest.fn(),
    };
    workflowAuthorizationService = {
      assertSameTeamAsProcessVersionOwner: jest.fn(),
    };
    auditLogWriterService = {
      create: jest.fn(),
    };
    service = new AssetsService(
      assetsRepository as unknown as AssetsRepository,
      processVersionsRepository as unknown as ProcessVersionsRepository,
      workflowAuthorizationService as unknown as WorkflowAuthorizationService,
      auditLogWriterService as unknown as AuditLogWriterService,
    );
  });

  it('rejects BPMN upload for non-draft versions', async () => {
    processVersionsRepository.findById.mockResolvedValue({
      id: 'version-1',
      processId: 'process-1',
      versionNumber: 1,
      lifecycleState: 'Published',
      architectureState: 'AS-IS',
      title: 'Published',
      checklistCompleted: true,
      derivedFromVersionId: null,
      changeDescription: 'change',
      reasonForChange: 'reason',
    });

    await expect(
      service.createBpmnAsset(
        'version-1',
        {
          caption: 'Diagram',
          filePath: 'uploads/seed/process-1-v1.bpmn',
          mimeType: 'application/xml',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('validates BPMN XML content and computes checksum metadata', async () => {
    const readFileMock = jest.mocked(readFile);

    processVersionsRepository.findById.mockResolvedValue({
      id: 'version-1',
      processId: 'process-1',
      versionNumber: 1,
      lifecycleState: 'Draft',
      architectureState: 'AS-IS',
      title: 'Draft',
      checklistCompleted: false,
      derivedFromVersionId: null,
      changeDescription: 'change',
      reasonForChange: 'reason',
    });
    readFileMock.mockResolvedValue(
      '<?xml version="1.0"?><bpmn:definitions><bpmn:process id="p1" /></bpmn:definitions>',
    );
    assetsRepository.createBpmnAsset.mockResolvedValue({
      id: 'asset-1',
      processVersionId: 'version-1',
      caption: 'Diagram',
      assetType: 'BPMN',
      filePath: 'seed/process-1-v1.bpmn',
      mimeType: 'application/xml',
      checksum: 'checksum',
      sizeBytes: TEST_FILE_SIZE_BYTES_SMALL,
    });

    await service.createBpmnAsset(
      'version-1',
      {
        caption: 'Diagram',
        filePath: 'seed/process-1-v1.bpmn',
        mimeType: 'application/xml',
      },
      currentUser,
    );

    const createInput = assetsRepository.createBpmnAsset.mock.calls[0]?.[0];

    expect(createInput).toMatchObject({
      caption: 'Diagram',
      filePath: 'seed/process-1-v1.bpmn',
      mimeType: 'application/xml',
    });
    expect(typeof createInput?.checksum).toBe('string');
    expect(typeof createInput?.sizeBytes).toBe('number');
  });

  it('rejects non-BPMN XML payloads', async () => {
    const readFileMock = jest.mocked(readFile);

    processVersionsRepository.findById.mockResolvedValue({
      id: 'version-1',
      processId: 'process-1',
      versionNumber: 1,
      lifecycleState: 'Draft',
      architectureState: 'AS-IS',
      title: 'Draft',
      checklistCompleted: false,
      derivedFromVersionId: null,
      changeDescription: 'change',
      reasonForChange: 'reason',
    });
    readFileMock.mockResolvedValue('<xml><not-bpmn /></xml>');

    await expect(
      service.createBpmnAsset(
        'version-1',
        {
          caption: 'Diagram',
          filePath: 'seed/process-1-v1.bpmn',
          mimeType: 'application/xml',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects missing BPMN files', async () => {
    const readFileMock = jest.mocked(readFile);

    processVersionsRepository.findById.mockResolvedValue({
      id: 'version-1',
      processId: 'process-1',
      versionNumber: 1,
      lifecycleState: 'Draft',
      architectureState: 'AS-IS',
      title: 'Draft',
      checklistCompleted: false,
      derivedFromVersionId: null,
      changeDescription: 'change',
      reasonForChange: 'reason',
    });
    readFileMock.mockRejectedValue(new Error('ENOENT'));

    await expect(
      service.createBpmnAsset(
        'version-1',
        {
          caption: 'Diagram',
          filePath: 'seed/process-1-v1.bpmn',
          mimeType: 'application/xml',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
