import { ConflictException } from '@nestjs/common';

import { Role } from '../../common/enums/role.enum';
import type { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { ItilPracticesRepository } from './itil-practices.repository';
import { ItilPracticesService } from './itil-practices.service';

describe('ItilPracticesService', () => {
  let repository: jest.Mocked<
    Pick<
      ItilPracticesRepository,
      'create' | 'findAll' | 'findByCodeOrName' | 'findById'
    >
  >;
  let auditLogWriterService: jest.Mocked<Pick<AuditLogWriterService, 'create'>>;
  let service: ItilPracticesService;

  const currentUser: AuthenticatedUser = {
    id: 'user-1',
    name: 'Editor User',
    email: 'editor@example.com',
    roleId: 'role-1',
    role: Role.EDITOR,
    team: null,
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByCodeOrName: jest.fn(),
      findById: jest.fn(),
    };
    auditLogWriterService = {
      create: jest.fn(),
    };
    service = new ItilPracticesService(
      repository as unknown as ItilPracticesRepository,
      auditLogWriterService as unknown as AuditLogWriterService,
    );
  });

  it('creates an ITIL practice and writes an audit row', async () => {
    const createdPractice = {
      id: 'practice-1',
      code: 'CHANGE_CONTROL',
      name: 'Change control',
      description: 'Change governance',
    };

    repository.findByCodeOrName.mockResolvedValue(null);
    repository.create.mockResolvedValue(createdPractice);

    await expect(
      service.create(
        {
          code: 'CHANGE_CONTROL',
          name: 'Change control',
          description: 'Change governance',
        },
        currentUser,
      ),
    ).resolves.toEqual(createdPractice);

    expect(auditLogWriterService.create).toHaveBeenCalledWith({
      entityType: 'itil_practice',
      entityId: 'practice-1',
      action: 'CREATE',
      actorId: 'user-1',
      reasonForChange: 'Created ITIL practice via API',
      newData: createdPractice,
    });
  });

  it('rejects duplicate code or name', async () => {
    repository.findByCodeOrName.mockResolvedValue({
      id: 'practice-1',
      code: 'CHANGE_CONTROL',
      name: 'Change control',
      description: null,
    });

    await expect(
      service.create(
        {
          code: 'CHANGE_CONTROL',
          name: 'Change control',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('lists ITIL practices', async () => {
    const practices = [
      {
        id: 'practice-1',
        code: 'CHANGE_CONTROL',
        name: 'Change control',
        description: null,
      },
    ];
    repository.findAll.mockResolvedValue(practices);

    await expect(service.list()).resolves.toEqual(practices);
  });
});
