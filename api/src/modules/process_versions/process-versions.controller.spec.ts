import { GUARDS_METADATA } from '@nestjs/common/constants';

import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { ProcessVersionsController } from './process-versions.controller';
import { ProcessVersionsService } from './process-versions.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { ProcessVersionRecord } from './process-versions.repository';

type ControllerMethod = (...args: never[]) => unknown;

function getControllerMethod(target: object, key: string): ControllerMethod {
  const method: unknown = Object.getOwnPropertyDescriptor(target, key)?.value;

  if (typeof method !== 'function') {
    throw new TypeError(`Expected "${key}" to be a controller method`);
  }

  return method as ControllerMethod;
}

describe('ProcessVersionsController metadata', () => {
  it('protects the controller with JWT and roles guards', () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, ProcessVersionsController),
    ).toEqual([JwtAuthGuard, RolesGuard]);
  });

  it('restricts editor workflow methods to EDITOR', () => {
    for (const methodName of [
      'create',
      'update',
      'delete',
      'submitForReview',
    ]) {
      expect(
        Reflect.getMetadata(
          ROLES_KEY,
          getControllerMethod(ProcessVersionsController.prototype, methodName),
        ),
      ).toEqual([Role.EDITOR]);
    }
  });

  it('restricts reviewer lifecycle methods to REVIEWER', () => {
    for (const methodName of ['approve', 'reject', 'reopen']) {
      expect(
        Reflect.getMetadata(
          ROLES_KEY,
          getControllerMethod(ProcessVersionsController.prototype, methodName),
        ),
      ).toEqual([Role.REVIEWER]);
    }
  });

  it('restricts publisher lifecycle methods to PUBLISHER', () => {
    for (const methodName of ['publish', 'archive', 'promote']) {
      expect(
        Reflect.getMetadata(
          ROLES_KEY,
          getControllerMethod(ProcessVersionsController.prototype, methodName),
        ),
      ).toEqual([Role.PUBLISHER]);
    }
  });

  it('restricts version reads to content roles', () => {
    for (const methodName of ['listByProcessId', 'getById']) {
      expect(
        Reflect.getMetadata(
          ROLES_KEY,
          getControllerMethod(ProcessVersionsController.prototype, methodName),
        ),
      ).toEqual([Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER]);
    }
  });
});

describe('ProcessVersionsController', () => {
  let controller: ProcessVersionsController;
  let processVersionsService: jest.Mocked<
    Pick<
      ProcessVersionsService,
      | 'create'
      | 'listByProcessId'
      | 'getById'
      | 'update'
      | 'delete'
      | 'submitForReview'
      | 'approve'
      | 'reject'
      | 'reopen'
      | 'publish'
      | 'archive'
      | 'promote'
    >
  >;

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

  const mockVersion: ProcessVersionRecord = {
    id: 'version-1',
    processId: 'process-1',
    versionNumber: 1,
    lifecycleState: 'Draft',
    architectureState: 'TO-BE',
    title: 'Test Version',
    checklistCompleted: false,
    derivedFromVersionId: null,
    changeDescription: 'Test change',
    reasonForChange: 'Test reason',
  };

  beforeEach(() => {
    processVersionsService = {
      create: jest.fn(),
      listByProcessId: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      submitForReview: jest.fn(),
      approve: jest.fn(),
      reject: jest.fn(),
      reopen: jest.fn(),
      publish: jest.fn(),
      archive: jest.fn(),
      promote: jest.fn(),
    };

    controller = new ProcessVersionsController(
      processVersionsService as unknown as ProcessVersionsService,
    );
  });

  it('should create a process version', async () => {
    processVersionsService.create.mockResolvedValue(mockVersion);

    const result = await controller.create(
      { processId: 'process-1' },
      {
        title: 'Test Version',
        architectureState: 'TO-BE',
        changeDescription: 'Test change',
        reasonForChange: 'Test reason',
      },
      mockUser,
    );

    expect(result).toEqual(mockVersion);
    expect(processVersionsService.create).toHaveBeenCalledWith(
      'process-1',
      {
        title: 'Test Version',
        architectureState: 'TO-BE',
        changeDescription: 'Test change',
        reasonForChange: 'Test reason',
      },
      mockUser,
    );
  });

  it('should list versions by process ID', async () => {
    processVersionsService.listByProcessId.mockResolvedValue([mockVersion]);

    const result = await controller.listByProcessId(
      {
        processId: 'process-1',
      },
      mockUser,
    );

    expect(result).toEqual([mockVersion]);
    expect(processVersionsService.listByProcessId).toHaveBeenCalledWith(
      'process-1',
      mockUser,
    );
  });

  it('should get version by ID', async () => {
    processVersionsService.getById.mockResolvedValue(mockVersion);

    const result = await controller.getById({ id: 'version-1' }, mockUser);

    expect(result).toEqual(mockVersion);
    expect(processVersionsService.getById).toHaveBeenCalledWith(
      'version-1',
      mockUser,
    );
  });

  it('should update a version', async () => {
    const updatedVersion = { ...mockVersion, title: 'Updated' };
    processVersionsService.update.mockResolvedValue(updatedVersion);

    const result = await controller.update(
      { id: 'version-1' },
      { title: 'Updated' },
      mockUser,
    );

    expect(result).toEqual(updatedVersion);
    expect(processVersionsService.update).toHaveBeenCalledWith(
      'version-1',
      { title: 'Updated' },
      mockUser,
    );
  });

  it('should delete a version', async () => {
    processVersionsService.delete.mockResolvedValue(undefined);

    await controller.delete({ id: 'version-1' }, mockUser);

    expect(processVersionsService.delete).toHaveBeenCalledWith(
      'version-1',
      mockUser,
    );
  });

  it('should submit for review', async () => {
    const reviewedVersion = { ...mockVersion, lifecycleState: 'In Review' };
    processVersionsService.submitForReview.mockResolvedValue(reviewedVersion);

    const result = await controller.submitForReview(
      { id: 'version-1' },
      { reason: 'Test' },
      mockUser,
    );

    expect(result).toEqual(reviewedVersion);
    expect(processVersionsService.submitForReview).toHaveBeenCalledWith(
      'version-1',
      { reason: 'Test' },
      mockUser,
    );
  });

  it('should approve a version', async () => {
    const approvedVersion = { ...mockVersion, lifecycleState: 'Approved' };
    processVersionsService.approve.mockResolvedValue(approvedVersion);

    const result = await controller.approve(
      { id: 'version-1' },
      { reason: 'Test' },
      mockUser,
    );

    expect(result).toEqual(approvedVersion);
    expect(processVersionsService.approve).toHaveBeenCalledWith(
      'version-1',
      { reason: 'Test' },
      mockUser,
    );
  });

  it('should reject a version', async () => {
    const rejectedVersion = { ...mockVersion, lifecycleState: 'Draft' };
    processVersionsService.reject.mockResolvedValue(rejectedVersion);

    const result = await controller.reject(
      { id: 'version-1' },
      { reason: 'Test rejection' },
      mockUser,
    );

    expect(result).toEqual(rejectedVersion);
    expect(processVersionsService.reject).toHaveBeenCalledWith(
      'version-1',
      { reason: 'Test rejection' },
      mockUser,
    );
  });

  it('should publish a version', async () => {
    const publishedVersion = { ...mockVersion, lifecycleState: 'Published' };
    processVersionsService.publish.mockResolvedValue(publishedVersion);

    const result = await controller.publish(
      { id: 'version-1' },
      { reason: 'Test' },
      mockUser,
    );

    expect(result).toEqual(publishedVersion);
    expect(processVersionsService.publish).toHaveBeenCalledWith(
      'version-1',
      { reason: 'Test' },
      mockUser,
    );
  });

  it('should promote a version', async () => {
    const promotedVersion = {
      ...mockVersion,
      architectureState: 'AS-IS',
      lifecycleState: 'Published',
    };
    processVersionsService.promote.mockResolvedValue(promotedVersion);

    const result = await controller.promote(
      { id: 'version-1' },
      { title: 'Promoted Version', justification: 'Test' },
      mockUser,
    );

    expect(result).toEqual(promotedVersion);
    expect(processVersionsService.promote).toHaveBeenCalledWith(
      'version-1',
      { title: 'Promoted Version', justification: 'Test' },
      mockUser,
    );
  });
});
