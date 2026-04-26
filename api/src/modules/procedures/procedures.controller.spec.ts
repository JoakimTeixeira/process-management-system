import { ProceduresController } from './procedures.controller';
import { ProceduresService } from './procedures.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Role } from '../../common/enums/role.enum';
import type { ProcedureRecord } from './procedures.repository';

describe('ProceduresController', () => {
  let controller: ProceduresController;
  let proceduresService: jest.Mocked<
    Pick<
      ProceduresService,
      'create' | 'listByProcessVersionId' | 'getById' | 'update' | 'delete'
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
    activities: [],
    inputs: [],
    outputs: [],
  };

  beforeEach(() => {
    proceduresService = {
      create: jest.fn(),
      listByProcessVersionId: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<
      Pick<
        ProceduresService,
        'create' | 'listByProcessVersionId' | 'getById' | 'update' | 'delete'
      >
    >;

    controller = new ProceduresController(
      proceduresService as unknown as ProceduresService,
    );
  });

  it('should create a procedure', async () => {
    proceduresService.create.mockResolvedValue(mockProcedure);

    const result = await controller.create(
      { processVersionId: 'version-1' },
      {
        code: 'PROC-001',
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
        code: 'PROC-001',
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

    const result = await controller.listByProcessVersionId({
      processVersionId: 'version-1',
    });

    expect(result).toEqual([mockProcedure]);
    expect(proceduresService.listByProcessVersionId).toHaveBeenCalledWith(
      'version-1',
    );
  });

  it('should get procedure by ID', async () => {
    proceduresService.getById.mockResolvedValue(mockProcedure);

    const result = await controller.getById({ id: 'proc-1' });

    expect(result).toEqual(mockProcedure);
    expect(proceduresService.getById).toHaveBeenCalledWith('proc-1');
  });

  it('should update a procedure', async () => {
    const updatedProcedure = { ...mockProcedure, title: 'Updated' };
    proceduresService.update.mockResolvedValue(updatedProcedure);

    const result = await controller.update(
      { id: 'proc-1' },
      { title: 'Updated' },
      mockUser,
    );

    expect(result).toEqual(updatedProcedure);
    expect(proceduresService.update).toHaveBeenCalledWith(
      'proc-1',
      { title: 'Updated' },
      mockUser,
    );
  });

  it('should delete a procedure', async () => {
    proceduresService.delete.mockResolvedValue(undefined);

    await controller.delete({ id: 'proc-1' }, mockUser);

    expect(proceduresService.delete).toHaveBeenCalledWith('proc-1', mockUser);
  });
});
