import { ConflictException, NotFoundException } from '@nestjs/common';

import { Role } from '../../common/enums/role.enum';
import type { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { ItilPracticesService } from '../itil_practices/itil-practices.service';
import type { AreasRepository } from './areas.repository';
import { AreasService } from './areas.service';

describe('AreasService', () => {
  let repository: jest.Mocked<
    Pick<
      AreasRepository,
      | 'create'
      | 'findAll'
      | 'findByCode'
      | 'findById'
      | 'ownerExists'
      | 'update'
    >
  >;
  let itilPracticesService: jest.Mocked<Pick<ItilPracticesService, 'findById'>>;
  let auditLogWriterService: jest.Mocked<Pick<AuditLogWriterService, 'create'>>;
  let service: AreasService;

  const currentUser: AuthenticatedUser = {
    id: 'user-1',
    name: 'Editor User',
    email: 'editor@example.com',
    roleId: 'role-1',
    role: Role.EDITOR,
    team: null,
  };

  const existingArea = {
    id: 'area-1',
    code: 'AREA_CHANGE',
    title: 'Change Area',
    description: 'Area description',
    ownerId: 'owner-1',
    itilPracticeId: 'practice-1',
    itilPracticeName: 'Change control',
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByCode: jest.fn(),
      findById: jest.fn(),
      ownerExists: jest.fn(),
      update: jest.fn(),
    };
    itilPracticesService = {
      findById: jest.fn(),
    };
    auditLogWriterService = {
      create: jest.fn(),
    };
    service = new AreasService(
      repository as unknown as AreasRepository,
      itilPracticesService as unknown as ItilPracticesService,
      auditLogWriterService as unknown as AuditLogWriterService,
    );
  });

  it('creates an area and writes an audit row', async () => {
    repository.ownerExists.mockResolvedValue(true);
    itilPracticesService.findById.mockResolvedValue({
      id: 'practice-1',
      code: 'CHANGE_CONTROL',
      name: 'Change control',
      description: null,
    });
    repository.findByCode.mockResolvedValue(null);
    repository.create.mockResolvedValue(existingArea);

    await expect(
      service.create(
        {
          code: 'AREA_CHANGE',
          title: 'Change Area',
          ownerId: 'owner-1',
          itilPracticeId: 'practice-1',
          description: 'Area description',
        },
        currentUser,
      ),
    ).resolves.toEqual(existingArea);

    expect(auditLogWriterService.create).toHaveBeenCalledWith({
      entityType: 'area',
      entityId: 'area-1',
      action: 'CREATE',
      actorId: 'user-1',
      reasonForChange: 'Created area via API',
      newData: {
        id: 'area-1',
        code: 'AREA_CHANGE',
        title: 'Change Area',
        description: 'Area description',
        ownerId: 'owner-1',
        itilPracticeId: 'practice-1',
        itilPractice: {
          id: 'practice-1',
          name: 'Change control',
        },
      },
    });
  });

  it('rejects create when owner does not exist', async () => {
    repository.ownerExists.mockResolvedValue(false);

    await expect(
      service.create(
        {
          code: 'AREA_CHANGE',
          title: 'Change Area',
          ownerId: 'missing-owner',
          itilPracticeId: 'practice-1',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects create when ITIL practice does not exist', async () => {
    repository.ownerExists.mockResolvedValue(true);
    itilPracticesService.findById.mockResolvedValue(null);

    await expect(
      service.create(
        {
          code: 'AREA_CHANGE',
          title: 'Change Area',
          ownerId: 'owner-1',
          itilPracticeId: 'missing-practice',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects duplicate area code on create', async () => {
    repository.ownerExists.mockResolvedValue(true);
    itilPracticesService.findById.mockResolvedValue({
      id: 'practice-1',
      code: 'CHANGE_CONTROL',
      name: 'Change control',
      description: null,
    });
    repository.findByCode.mockResolvedValue(existingArea);

    await expect(
      service.create(
        {
          code: 'AREA_CHANGE',
          title: 'Change Area',
          ownerId: 'owner-1',
          itilPracticeId: 'practice-1',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('lists and gets areas', async () => {
    repository.findAll.mockResolvedValue([existingArea]);
    repository.findById.mockResolvedValue(existingArea);

    await expect(service.list()).resolves.toEqual([existingArea]);
    await expect(service.getById('area-1')).resolves.toEqual(existingArea);
  });

  it('rejects getById when the area does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.getById('missing-area')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('validates changed ownerId and itilPracticeId during update', async () => {
    repository.findById.mockResolvedValue(existingArea);
    repository.findByCode.mockResolvedValue(null);
    repository.ownerExists.mockResolvedValue(true);
    itilPracticesService.findById.mockResolvedValue({
      id: 'practice-2',
      code: 'INCIDENT_MANAGEMENT',
      name: 'Incident management',
      description: null,
    });
    repository.update.mockResolvedValue({
      ...existingArea,
      ownerId: 'owner-2',
      itilPracticeId: 'practice-2',
      itilPracticeName: 'Incident management',
    });

    await expect(
      service.update(
        'area-1',
        {
          ownerId: 'owner-2',
          itilPracticeId: 'practice-2',
        },
        currentUser,
      ),
    ).resolves.toEqual({
      ...existingArea,
      ownerId: 'owner-2',
      itilPracticeId: 'practice-2',
      itilPracticeName: 'Incident management',
    });
  });

  it('rejects update when the changed owner does not exist', async () => {
    repository.findById.mockResolvedValue(existingArea);
    repository.ownerExists.mockResolvedValue(false);

    await expect(
      service.update(
        'area-1',
        {
          ownerId: 'missing-owner',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects update when the changed ITIL practice does not exist', async () => {
    repository.findById.mockResolvedValue(existingArea);
    itilPracticesService.findById.mockResolvedValue(null);

    await expect(
      service.update(
        'area-1',
        {
          itilPracticeId: 'missing-practice',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects duplicate area code on update', async () => {
    repository.findById.mockResolvedValue(existingArea);
    repository.findByCode.mockResolvedValue({
      ...existingArea,
      id: 'area-2',
      code: 'AREA_NEW',
    });

    await expect(
      service.update(
        'area-1',
        {
          code: 'AREA_NEW',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('writes an audit row on update', async () => {
    const updatedArea = {
      ...existingArea,
      title: 'Updated Change Area',
    };

    repository.findById.mockResolvedValue(existingArea);
    repository.update.mockResolvedValue(updatedArea);

    await expect(
      service.update(
        'area-1',
        {
          title: 'Updated Change Area',
        },
        currentUser,
      ),
    ).resolves.toEqual(updatedArea);

    expect(auditLogWriterService.create).toHaveBeenCalledWith({
      entityType: 'area',
      entityId: 'area-1',
      action: 'UPDATE',
      actorId: 'user-1',
      reasonForChange: 'Updated area via API',
      oldData: {
        id: 'area-1',
        code: 'AREA_CHANGE',
        title: 'Change Area',
        description: 'Area description',
        ownerId: 'owner-1',
        itilPracticeId: 'practice-1',
        itilPractice: {
          id: 'practice-1',
          name: 'Change control',
        },
      },
      newData: {
        id: 'area-1',
        code: 'AREA_CHANGE',
        title: 'Updated Change Area',
        description: 'Area description',
        ownerId: 'owner-1',
        itilPracticeId: 'practice-1',
        itilPractice: {
          id: 'practice-1',
          name: 'Change control',
        },
      },
    });
  });
});
