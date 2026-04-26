import { ProcessesController } from './processes.controller';
import { ProcessesService } from './processes.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Role } from '../../common/enums/role.enum';
import type { ProcessRecord } from './processes.repository';

describe('ProcessesController', () => {
  let controller: ProcessesController;
  let processesService: jest.Mocked<
    Pick<ProcessesService, 'create' | 'list' | 'getById' | 'update' | 'delete'>
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

  const mockProcess: ProcessRecord = {
    id: 'process-1',
    code: '1',
    title: 'Test Process',
    description: 'Test description',
    areaId: 'area-1',
    ownerId: 'owner-1',
  };

  beforeEach(() => {
    processesService = {
      create: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<
      Pick<ProcessesService, 'create' | 'list' | 'getById' | 'update' | 'delete'>
    >;

    controller = new ProcessesController(
      processesService as unknown as ProcessesService,
    );
  });

  it('should create a process', async () => {
    processesService.create.mockResolvedValue(mockProcess);

    const result = await controller.create(
      {
        areaId: 'area-1',
        title: 'Test Process',
        ownerId: 'owner-1',
        description: 'Test description',
      },
      mockUser,
    );

    expect(result).toEqual(mockProcess);
    expect(processesService.create).toHaveBeenCalledWith(
      {
        areaId: 'area-1',
        title: 'Test Process',
        ownerId: 'owner-1',
        description: 'Test description',
      },
      mockUser,
    );
  });

  it('should list all processes', async () => {
    processesService.list.mockResolvedValue([mockProcess]);

    const result = await controller.list();

    expect(result).toEqual([mockProcess]);
    expect(processesService.list).toHaveBeenCalled();
  });

  it('should get process by ID', async () => {
    processesService.getById.mockResolvedValue(mockProcess);

    const result = await controller.getById({ id: 'process-1' });

    expect(result).toEqual(mockProcess);
    expect(processesService.getById).toHaveBeenCalledWith('process-1');
  });

  it('should update a process', async () => {
    const updatedProcess = { ...mockProcess, title: 'Updated' };
    processesService.update.mockResolvedValue(updatedProcess);

    const result = await controller.update(
      { id: 'process-1' },
      { title: 'Updated' },
      mockUser,
    );

    expect(result).toEqual(updatedProcess);
    expect(processesService.update).toHaveBeenCalledWith(
      'process-1',
      { title: 'Updated' },
      mockUser,
    );
  });

  it('should delete a process', async () => {
    processesService.delete.mockResolvedValue(undefined);

    await controller.delete({ id: 'process-1' }, mockUser);

    expect(processesService.delete).toHaveBeenCalledWith('process-1', mockUser);
  });
});
