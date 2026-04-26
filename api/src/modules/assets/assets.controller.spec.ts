import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Role } from '../../common/enums/role.enum';
import type { AssetRecord } from './assets.repository';

describe('AssetsController', () => {
  let controller: AssetsController;
  let assetsService: Pick<
    AssetsService,
    'createBpmnAsset' | 'listByProcessVersionId'
  > & {
    createBpmnAsset: jest.Mock;
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
    sizeBytes: 1024,
  };

  beforeEach(() => {
    assetsService = {
      createBpmnAsset: jest.fn(),
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
        filePath: '/uploads/test.bpmn',
        mimeType: 'application/xml',
      },
      mockUser,
    );

    expect(result).toEqual(mockAsset);
    expect(assetsService.createBpmnAsset).toHaveBeenCalledWith(
      'version-1',
      {
        caption: 'Test BPMN',
        filePath: '/uploads/test.bpmn',
        mimeType: 'application/xml',
      },
      mockUser,
    );
  });

  it('should list assets by process version ID', async () => {
    assetsService.listByProcessVersionId.mockResolvedValue([mockAsset]);

    const result = await controller.listByProcessVersionId({
      processVersionId: 'version-1',
    });

    expect(result).toEqual([mockAsset]);
    expect(assetsService.listByProcessVersionId).toHaveBeenCalledWith(
      'version-1',
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
          filePath: '/uploads/test.bpmn',
          mimeType: 'application/xml',
        },
        mockUser,
      ),
    ).rejects.toThrow('Failed to create asset');
  });

  it('should throw error when listing assets fails', async () => {
    const error = new Error('Failed to list assets');
    assetsService.listByProcessVersionId.mockRejectedValue(error);

    await expect(
      controller.listByProcessVersionId({
        processVersionId: 'version-1',
      }),
    ).rejects.toThrow('Failed to list assets');
  });

  it('should return empty array when no assets found', async () => {
    assetsService.listByProcessVersionId.mockResolvedValue([]);

    const result = await controller.listByProcessVersionId({
      processVersionId: 'version-1',
    });

    expect(result).toEqual([]);
    expect(assetsService.listByProcessVersionId).toHaveBeenCalledWith(
      'version-1',
    );
  });
});
