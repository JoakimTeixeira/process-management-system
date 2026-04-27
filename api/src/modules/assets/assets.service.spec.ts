import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { ConflictException, ForbiddenException } from '@nestjs/common';

import { Role } from '../../common/enums/role.enum';
import { TEST_FILE_SIZE_BYTES_SMALL } from '../../common/constants/workflow.constants';
import type { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { ProcessVersionsRepository } from '../process_versions/process-versions.repository';
import type { WorkflowAuthorizationService } from '../workflow_support/workflow-authorization.service';
import type { AssetsRepository } from './assets.repository';
import { AssetsService } from './assets.service';

jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

describe('AssetsService', () => {
  let assetsRepository: jest.Mocked<
    Pick<
      AssetsRepository,
      'createBpmnAsset' | 'findById' | 'findByProcessVersionId'
    >
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
      findById: jest.fn(),
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
        },
        {
          buffer: Buffer.from('<definitions><process /></definitions>'),
          originalname: 'diagram.bpmn',
          mimetype: 'application/xml',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('validates BPMN XML content and computes checksum metadata', async () => {
    const mkdirMock = jest.mocked(mkdir);
    const writeFileMock = jest.mocked(writeFile);

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
    mkdirMock.mockResolvedValue(undefined);
    writeFileMock.mockResolvedValue(undefined);
    assetsRepository.createBpmnAsset.mockResolvedValue({
      id: 'asset-1',
      processVersionId: 'version-1',
      caption: 'Diagram',
      assetType: 'BPMN',
      filePath: 'backoffice/bpmn/test.bpmn',
      mimeType: 'application/xml',
      checksum: 'checksum',
      sizeBytes: TEST_FILE_SIZE_BYTES_SMALL,
    });

    await service.createBpmnAsset(
      'version-1',
      {
        caption: 'Diagram',
      },
      {
        buffer: Buffer.from(
          '<?xml version="1.0"?><bpmn:definitions><bpmn:process id="p1" /></bpmn:definitions>',
        ),
        originalname: 'diagram.bpmn',
        mimetype: 'application/xml',
      },
      currentUser,
    );

    const createInput = assetsRepository.createBpmnAsset.mock.calls[0]?.[0] as
      | {
          caption: string;
          filePath: string;
          mimeType: string;
          checksum: string;
          sizeBytes: number;
        }
      | undefined;

    expect(createInput).toBeDefined();
    expect(createInput?.caption).toBe('Diagram');
    expect(createInput?.filePath).toContain('backoffice/bpmn/');
    expect(createInput?.mimeType).toBe('application/xml');
    expect(typeof createInput?.checksum).toBe('string');
    expect(typeof createInput?.sizeBytes).toBe('number');
    expect(
      workflowAuthorizationService.assertSameTeamAsProcessVersionOwner,
    ).toHaveBeenCalledWith('version-1', currentUser);
    expect(auditLogWriterService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'asset',
        entityId: 'asset-1',
        action: 'UPLOAD',
        actorId: currentUser.id,
      }),
    );
  });

  it('rejects non-BPMN XML payloads', async () => {
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
    await expect(
      service.createBpmnAsset(
        'version-1',
        {
          caption: 'Diagram',
        },
        {
          buffer: Buffer.from('<xml><not-bpmn /></xml>'),
          originalname: 'diagram.xml',
          mimetype: 'application/xml',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects missing BPMN uploads', async () => {
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
    await expect(
      service.createBpmnAsset(
        'version-1',
        {
          caption: 'Diagram',
        },
        {
          buffer: Buffer.alloc(0),
          originalname: 'diagram.bpmn',
          mimetype: 'application/xml',
        },
        currentUser,
      ),
    ).rejects.toMatchObject({ message: 'A BPMN file upload is required' });
  });

  it('returns stored asset content', async () => {
    const readFileMock = jest.mocked(readFile);

    assetsRepository.findById.mockResolvedValue({
      id: 'asset-1',
      processVersionId: 'version-1',
      caption: 'Diagram',
      assetType: 'BPMN',
      filePath: 'backoffice/bpmn/test.bpmn',
      mimeType: 'application/xml',
      checksum: 'checksum',
      sizeBytes: TEST_FILE_SIZE_BYTES_SMALL,
    });
    readFileMock.mockResolvedValue('<definitions><process /></definitions>');

    await expect(
      service.getAssetContent('version-1', 'asset-1', currentUser),
    ).resolves.toMatchObject({
      id: 'asset-1',
      caption: 'Diagram',
      mimeType: 'application/xml',
    });
  });

  it('rejects BPMN upload for non-editor actors', async () => {
    await expect(
      service.createBpmnAsset(
        'version-1',
        {
          caption: 'Diagram',
        },
        {
          buffer: Buffer.from('<definitions><process /></definitions>'),
          originalname: 'diagram.bpmn',
          mimetype: 'application/xml',
        },
        { ...currentUser, role: Role.REVIEWER },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects asset reads for non-content roles', async () => {
    await expect(
      service.listByProcessVersionId('version-1', {
        ...currentUser,
        role: Role.SYSTEM_ADMIN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
