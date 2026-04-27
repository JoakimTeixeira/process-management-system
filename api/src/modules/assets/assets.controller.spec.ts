import { GUARDS_METADATA } from '@nestjs/common/constants';

import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Role } from '../../common/enums/role.enum';
import { TEST_FILE_SIZE_BYTES } from '../../common/constants/workflow.constants';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AssetRecord } from './assets.repository';

type ControllerMethod = (...args: never[]) => unknown;

function getControllerMethod(target: object, key: string): ControllerMethod {
  const method: unknown = Object.getOwnPropertyDescriptor(target, key)?.value;

  if (typeof method !== 'function') {
    throw new TypeError(`Expected "${key}" to be a controller method`);
  }

  return method as ControllerMethod;
}

describe('AssetsController metadata', () => {
  it('protects the controller with JWT and roles guards', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, AssetsController)).toEqual([
      JwtAuthGuard,
      RolesGuard,
    ]);
  });

  it('restricts BPMN upload to EDITOR', () => {
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        getControllerMethod(AssetsController.prototype, 'createBpmnAsset'),
      ),
    ).toEqual([Role.EDITOR]);
  });

  it('restricts BPMN reads to content roles', () => {
    for (const methodName of ['listByProcessVersionId', 'getAssetContent']) {
      expect(
        Reflect.getMetadata(
          ROLES_KEY,
          getControllerMethod(AssetsController.prototype, methodName),
        ),
      ).toEqual([Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER]);
    }
  });
});

describe('AssetsController', () => {
  let controller: AssetsController;
  let assetsService: Pick<
    AssetsService,
    'createBpmnAsset' | 'getAssetContent' | 'listByProcessVersionId'
  > & {
    createBpmnAsset: jest.Mock;
    getAssetContent: jest.Mock;
    listByProcessVersionId: jest.Mock;
  };

  const mockUser: AuthenticatedUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    roleId: 'role-1',
    role: Role.EDITOR,
    team: {
      id: 'team-1',
      code: 'HR',
      name: 'Human Resources',
    },
  };

  const mockAsset: AssetRecord = {
    id: 'asset-1',
    processVersionId: 'version-1',
    caption: 'Test BPMN',
    assetType: 'BPMN',
    filePath: '/uploads/test.bpmn',
    mimeType: 'application/xml',
    checksum: 'abc123',
    sizeBytes: TEST_FILE_SIZE_BYTES,
  };

  beforeEach(() => {
    assetsService = {
      createBpmnAsset: jest.fn(),
      getAssetContent: jest.fn(),
      listByProcessVersionId: jest.fn(),
    };

    controller = new AssetsController(
      assetsService as unknown as AssetsService,
    );
  });

  it('should create BPMN asset', async () => {
    assetsService.createBpmnAsset.mockResolvedValue(mockAsset);

    const result = await controller.createBpmnAsset(
      { processVersionId: 'version-1' },
      {
        caption: 'Test BPMN',
      },
      {
        buffer: Buffer.from('<definitions><process /></definitions>'),
        originalname: 'diagram.bpmn',
        mimetype: 'application/xml',
      },
      mockUser,
    );

    expect(result).toEqual(mockAsset);
    expect(assetsService.createBpmnAsset).toHaveBeenCalledWith(
      'version-1',
      {
        caption: 'Test BPMN',
      },
      expect.objectContaining({
        originalname: 'diagram.bpmn',
      }),
      mockUser,
    );
  });

  it('should list assets by process version ID', async () => {
    assetsService.listByProcessVersionId.mockResolvedValue([mockAsset]);

    const result = await controller.listByProcessVersionId(
      {
        processVersionId: 'version-1',
      },
      mockUser,
    );

    expect(result).toEqual([mockAsset]);
    expect(assetsService.listByProcessVersionId).toHaveBeenCalledWith(
      'version-1',
      mockUser,
    );
  });

  it('should throw error when asset creation fails', async () => {
    const error = new Error('Failed to create asset');
    assetsService.createBpmnAsset.mockRejectedValue(error);

    await expect(
      controller.createBpmnAsset(
        { processVersionId: 'version-1' },
        {
          caption: 'Test BPMN',
        },
        {
          buffer: Buffer.from('<definitions><process /></definitions>'),
          originalname: 'test.bpmn',
          mimetype: 'application/xml',
        },
        mockUser,
      ),
    ).rejects.toThrow('Failed to create asset');
  });

  it('should throw error when listing assets fails', async () => {
    const error = new Error('Failed to list assets');
    assetsService.listByProcessVersionId.mockRejectedValue(error);

    await expect(
      controller.listByProcessVersionId(
        {
          processVersionId: 'version-1',
        },
        mockUser,
      ),
    ).rejects.toThrow('Failed to list assets');
  });

  it('should return empty array when no assets found', async () => {
    assetsService.listByProcessVersionId.mockResolvedValue([]);

    const result = await controller.listByProcessVersionId(
      {
        processVersionId: 'version-1',
      },
      mockUser,
    );

    expect(result).toEqual([]);
    expect(assetsService.listByProcessVersionId).toHaveBeenCalledWith(
      'version-1',
      mockUser,
    );
  });

  it('should get BPMN asset content', async () => {
    assetsService.getAssetContent.mockResolvedValue({
      id: 'asset-1',
      caption: 'Test BPMN',
      filePath: 'backoffice/bpmn/test.bpmn',
      mimeType: 'application/xml',
      content: '<definitions><process /></definitions>',
    });

    const result = await controller.getAssetContent(
      {
        processVersionId: 'version-1',
        assetId: 'asset-1',
      },
      mockUser,
    );

    expect(result.content).toContain('<definitions>');
    expect(assetsService.getAssetContent).toHaveBeenCalledWith(
      'version-1',
      'asset-1',
      mockUser,
    );
  });
});
