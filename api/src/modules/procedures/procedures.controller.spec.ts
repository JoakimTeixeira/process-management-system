import { GUARDS_METADATA } from '@nestjs/common/constants';

import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ProceduresController } from './procedures.controller';
import { ProceduresService } from './procedures.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Role } from '../../common/enums/role.enum';
import type { ProcedureRecord } from './procedures.repository';
import { ProcedureActivityDto } from './dto/shared-procedure.dto';

type ControllerMethod = (...args: never[]) => unknown;

function getControllerMethod(target: object, key: string): ControllerMethod {
  const method: unknown = Object.getOwnPropertyDescriptor(target, key)?.value;

  if (typeof method !== 'function') {
    throw new TypeError(`Expected "${key}" to be a controller method`);
  }

  return method as ControllerMethod;
}

describe('ProceduresController metadata', () => {
  it('protects the controller with JWT and roles guards', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, ProceduresController)).toEqual([
      JwtAuthGuard,
      RolesGuard,
    ]);
  });

  it('restricts create, update, and delete to EDITOR', () => {
    for (const methodName of ['create', 'update', 'delete']) {
      expect(
        Reflect.getMetadata(
          ROLES_KEY,
          getControllerMethod(ProceduresController.prototype, methodName),
        ),
      ).toEqual([Role.EDITOR]);
    }
  });

  it('restricts procedure reads to content roles', () => {
    for (const methodName of ['listAll', 'listByProcessVersionId', 'getById']) {
      expect(
        Reflect.getMetadata(
          ROLES_KEY,
          getControllerMethod(ProceduresController.prototype, methodName),
        ),
      ).toEqual([Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER]);
    }
  });
});

describe('ProceduresController', () => {
  let controller: ProceduresController;
  let proceduresService: jest.Mocked<
    Pick<
      ProceduresService,
      | 'create'
      | 'listAll'
      | 'listByProcessVersionId'
      | 'getById'
      | 'update'
      | 'delete'
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

  const mockProcedure: ProcedureRecord = {
    id: 'proc-1',
    processVersionId: 'version-1',
    code: 'PROC-001',
    title: 'Test Procedure',
    utility: 'Test utility',
    warranty: 'Test warranty',
    outcome: 'Test outcome',
    policy: 'Test policy',
    activities: [] as Record<string, unknown>[],
    inputs: [],
    outputs: [],
  };

  beforeEach(() => {
    proceduresService = {
      create: jest.fn(),
      listAll: jest.fn(),
      listByProcessVersionId: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    controller = new ProceduresController(
      proceduresService as unknown as ProceduresService,
    );
  });

  it('should create a procedure', async () => {
    proceduresService.create.mockResolvedValue(mockProcedure);

    const result = await controller.create(
      { processVersionId: 'version-1' },
      {
        title: 'Test Procedure',
        utility: 'Test utility',
        warranty: 'Test warranty',
        outcome: 'Test outcome',
        policy: 'Test policy',
        activities: [],
        inputs: [],
        outputs: [],
      },
      mockUser,
    );

    expect(result).toEqual(mockProcedure);
    expect(proceduresService.create).toHaveBeenCalledWith(
      'version-1',
      {
        title: 'Test Procedure',
        utility: 'Test utility',
        warranty: 'Test warranty',
        outcome: 'Test outcome',
        policy: 'Test policy',
        activities: [],
        inputs: [],
        outputs: [],
      },
      mockUser,
    );
  });

  it('should list procedures by process version ID', async () => {
    proceduresService.listByProcessVersionId.mockResolvedValue([mockProcedure]);

    const result = await controller.listByProcessVersionId(
      {
        processVersionId: 'version-1',
      },
      mockUser,
    );

    expect(result).toEqual([mockProcedure]);
    expect(proceduresService.listByProcessVersionId).toHaveBeenCalledWith(
      'version-1',
      mockUser,
    );
  });

  it('should list all procedures for the backoffice workspace', async () => {
    const backofficeProcedure = {
      ...mockProcedure,
      processId: 'process-1',
      processCode: 'P.001',
      processTitle: 'Change Control',
      versionNumber: 2,
      lifecycleState: 'In Review',
      architectureState: 'TO-BE',
    };
    proceduresService.listAll.mockResolvedValue([backofficeProcedure]);

    const result = await controller.listAll(mockUser);

    expect(result).toEqual([backofficeProcedure]);
    expect(proceduresService.listAll).toHaveBeenCalledWith(mockUser);
  });

  it('should get procedure by ID', async () => {
    proceduresService.getById.mockResolvedValue(mockProcedure);

    const result = await controller.getById({ id: 'proc-1' }, mockUser);

    expect(result).toEqual(mockProcedure);
    expect(proceduresService.getById).toHaveBeenCalledWith('proc-1', mockUser);
  });

  it('should update a procedure', async () => {
    const updatedProcedure = { ...mockProcedure, title: 'Updated' };
    proceduresService.update.mockResolvedValue(updatedProcedure);

    const result = await controller.update(
      { id: 'proc-1' },
      {
        title: 'Updated',
        utility: mockProcedure.utility,
        warranty: mockProcedure.warranty,
        outcome: mockProcedure.outcome,
        policy: mockProcedure.policy,
        activities: [] as ProcedureActivityDto[],
        inputs: mockProcedure.inputs,
        outputs: mockProcedure.outputs,
      },
      mockUser,
    );

    expect(result).toEqual(updatedProcedure);
    expect(proceduresService.update).toHaveBeenCalledWith(
      'proc-1',
      {
        title: 'Updated',
        utility: mockProcedure.utility,
        warranty: mockProcedure.warranty,
        outcome: mockProcedure.outcome,
        policy: mockProcedure.policy,
        activities: [] as ProcedureActivityDto[],
        inputs: mockProcedure.inputs,
        outputs: mockProcedure.outputs,
      },
      mockUser,
    );
  });

  it('should delete a procedure', async () => {
    proceduresService.delete.mockResolvedValue(undefined);

    await controller.delete({ id: 'proc-1' }, mockUser);

    expect(proceduresService.delete).toHaveBeenCalledWith('proc-1', mockUser);
  });
});
