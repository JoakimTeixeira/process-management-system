import type { Mocked } from 'vitest';

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

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

describe('AssetsService', () => {
  let assetsRepository: Mocked<
    Pick<
      AssetsRepository,
      | 'createBpmnAsset'
      | 'findById'
      | 'findByProcessVersionId'
      | 'findCurrentByProcessVersionId'
      | 'supersedeAsset'
    >
  >;
  let processVersionsRepository: Mocked<
    Pick<ProcessVersionsRepository, 'findById'>
  >;
  let workflowAuthorizationService: Mocked<
    Pick<WorkflowAuthorizationService, 'assertSameTeamAsProcessVersionOwner'>
  >;
  let auditLogWriterService: Mocked<Pick<AuditLogWriterService, 'create'>>;
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
    vi.resetAllMocks();
    assetsRepository = {
      createBpmnAsset: vi.fn(),
      findById: vi.fn(),
      findByProcessVersionId: vi.fn(),
      findCurrentByProcessVersionId: vi.fn(),
      supersedeAsset: vi.fn(),
    };
    processVersionsRepository = {
      findById: vi.fn(),
    };
    workflowAuthorizationService = {
      assertSameTeamAsProcessVersionOwner: vi.fn(),
    };
    auditLogWriterService = {
      create: vi.fn(),
    };
    service = new AssetsService(
      assetsRepository as unknown as AssetsRepository,
      processVersionsRepository as unknown as ProcessVersionsRepository,
      workflowAuthorizationService as unknown as WorkflowAuthorizationService,
      auditLogWriterService as unknown as AuditLogWriterService,
    );
  });

  it('should reject BPMN upload for non-draft versions', async () => {
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

  it('should validate BPMN XML content and compute checksum metadata', async () => {
    const mkdirMock = vi.mocked(mkdir);
    const writeFileMock = vi.mocked(writeFile);

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
      isCurrent: true,
      supersededAt: null,
      supersededByAssetId: null,
      createdAt: '2026-04-28T12:00:00.000Z',
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

  it('should reject non-BPMN XML payloads', async () => {
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

  it('should not treat BPMN element names in attributes as BPMN elements', async () => {
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
        { caption: 'Diagram' },
        {
          buffer: Buffer.from(
            '<xml definitions="present" process="present" />',
          ),
          originalname: 'diagram.xml',
          mimetype: 'application/xml',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should normalize generic octet-stream BPMN uploads to application/xml metadata', async () => {
    const mkdirMock = vi.mocked(mkdir);
    const writeFileMock = vi.mocked(writeFile);

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
      isCurrent: true,
      supersededAt: null,
      supersededByAssetId: null,
      createdAt: '2026-04-28T12:00:00.000Z',
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
        mimetype: 'application/octet-stream',
      },
      currentUser,
    );

    expect(assetsRepository.createBpmnAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        mimeType: 'application/xml',
      }),
    );
  });

  it('should reject missing BPMN uploads', async () => {
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

  it('should return stored asset content', async () => {
    const readFileMock = vi.mocked(readFile);

    assetsRepository.findById.mockResolvedValue({
      id: 'asset-1',
      processVersionId: 'version-1',
      caption: 'Diagram',
      assetType: 'BPMN',
      filePath: 'backoffice/bpmn/test.bpmn',
      mimeType: 'application/xml',
      checksum: 'checksum',
      sizeBytes: TEST_FILE_SIZE_BYTES_SMALL,
      isCurrent: true,
      supersededAt: null,
      supersededByAssetId: null,
      createdAt: '2026-04-28T12:00:00.000Z',
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

  it('should reject BPMN upload for non-editor actors', async () => {
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

  it('should reject asset reads for non-content roles', async () => {
    await expect(
      service.listByProcessVersionId('version-1', {
        ...currentUser,
        role: Role.SYSTEM_ADMIN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should supersede existing asset when uploading new BPMN for same version', async () => {
    const mkdirMock = vi.mocked(mkdir);
    const writeFileMock = vi.mocked(writeFile);

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

    const existingAsset = {
      id: 'asset-old',
      processVersionId: 'version-1',
      caption: 'Old Diagram',
      assetType: 'BPMN',
      filePath: 'backoffice/bpmn/old.bpmn',
      mimeType: 'application/xml',
      checksum: 'old-checksum',
      sizeBytes: TEST_FILE_SIZE_BYTES_SMALL,
      isCurrent: true,
      supersededAt: null,
      supersededByAssetId: null,
      createdAt: '2026-04-28T12:00:00.000Z',
    };

    const newAsset = {
      id: 'asset-new',
      processVersionId: 'version-1',
      caption: 'New Diagram',
      assetType: 'BPMN',
      filePath: 'backoffice/bpmn/new.bpmn',
      mimeType: 'application/xml',
      checksum: 'new-checksum',
      sizeBytes: TEST_FILE_SIZE_BYTES_SMALL,
      isCurrent: true,
      supersededAt: null,
      supersededByAssetId: null,
      createdAt: '2026-04-28T12:05:00.000Z',
    };

    assetsRepository.findCurrentByProcessVersionId.mockResolvedValue(
      existingAsset,
    );
    assetsRepository.createBpmnAsset.mockResolvedValue(newAsset);
    assetsRepository.supersedeAsset.mockResolvedValue(undefined);
    mkdirMock.mockResolvedValue(undefined);
    writeFileMock.mockResolvedValue(undefined);

    await service.createBpmnAsset(
      'version-1',
      {
        caption: 'New Diagram',
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

    expect(assetsRepository.findCurrentByProcessVersionId).toHaveBeenCalledWith(
      'version-1',
    );
    expect(assetsRepository.supersedeAsset).toHaveBeenCalledWith(
      'asset-old',
      'asset-new',
    );
    expect(auditLogWriterService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'asset',
        entityId: 'asset-old',
        action: 'SUPERSEDE',
        actorId: currentUser.id,
        reasonForChange: 'Superseded BPMN asset by uploading new version',
      }),
    );
  });

  it('should not supersede when no existing asset exists', async () => {
    const mkdirMock = vi.mocked(mkdir);
    const writeFileMock = vi.mocked(writeFile);

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

    const newAsset = {
      id: 'asset-new',
      processVersionId: 'version-1',
      caption: 'New Diagram',
      assetType: 'BPMN',
      filePath: 'backoffice/bpmn/new.bpmn',
      mimeType: 'application/xml',
      checksum: 'new-checksum',
      sizeBytes: TEST_FILE_SIZE_BYTES_SMALL,
      isCurrent: true,
      supersededAt: null,
      supersededByAssetId: null,
      createdAt: '2026-04-28T12:00:00.000Z',
    };

    assetsRepository.findCurrentByProcessVersionId.mockResolvedValue(null);
    assetsRepository.createBpmnAsset.mockResolvedValue(newAsset);
    mkdirMock.mockResolvedValue(undefined);
    writeFileMock.mockResolvedValue(undefined);

    await service.createBpmnAsset(
      'version-1',
      {
        caption: 'New Diagram',
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

    expect(assetsRepository.findCurrentByProcessVersionId).toHaveBeenCalledWith(
      'version-1',
    );
    expect(assetsRepository.supersedeAsset).not.toHaveBeenCalled();
  });
});
