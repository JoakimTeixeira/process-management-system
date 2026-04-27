import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { Role } from '../../common/enums/role.enum';
import type { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { ItilPracticesService } from '../itil_practices/itil-practices.service';
import type { WorkflowAuthorizationService } from '../workflow_support/workflow-authorization.service';
import type { AreasRepository } from './areas.repository';
import { AreasService } from './areas.service';

describe('AreasService', () => {
  let repository: jest.Mocked<
    Pick<
      AreasRepository,
      | 'create'
      | 'delete'
      | 'findAll'
      | 'findByCode'
      | 'findById'
      | 'getNextAreaCode'
      | 'ownerExists'
      | 'teamExists'
      | 'userBelongsToTeam'
      | 'update'
    >
  >;
  let itilPracticesService: jest.Mocked<Pick<ItilPracticesService, 'findById'>>;
  let workflowAuthorizationService: jest.Mocked<
    Pick<WorkflowAuthorizationService, 'assertSameTeamAsUser'>
  >;
  let auditLogWriterService: jest.Mocked<Pick<AuditLogWriterService, 'create'>>;
  let service: AreasService;

  const currentUser: AuthenticatedUser = {
    id: 'user-1',
    name: 'Editor User',
    email: 'editor@example.com',
    roleId: 'role-1',
    role: Role.EDITOR,
    team: {
      id: 'team-1',
      code: 'HR',
      name: 'Human Resources',
    },
  };

  const existingArea = {
    id: 'area-1',
    code: 'AREA_CHANGE',
    title: 'Change Area',
    description: 'Area description',
    teamId: 'team-1',
    ownerId: 'owner-1',
    itilPracticeId: 'practice-1',
    itilPracticeName: 'Change control',
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findByCode: jest.fn(),
      findById: jest.fn(),
      getNextAreaCode: jest.fn(),
      ownerExists: jest.fn(),
      teamExists: jest.fn(),
      userBelongsToTeam: jest.fn(),
      update: jest.fn(),
    };
    itilPracticesService = {
      findById: jest.fn(),
    };
    workflowAuthorizationService = {
      assertSameTeamAsUser: jest.fn(),
    };
    auditLogWriterService = {
      create: jest.fn(),
    };
    service = new AreasService(
      repository as unknown as AreasRepository,
      itilPracticesService as unknown as ItilPracticesService,
      workflowAuthorizationService as unknown as WorkflowAuthorizationService,
      auditLogWriterService as unknown as AuditLogWriterService,
    );
  });

  it('should create an area and write an audit row', async () => {
    repository.ownerExists.mockResolvedValue(true);
    repository.teamExists.mockResolvedValue(true);
    repository.userBelongsToTeam.mockResolvedValue(true);
    itilPracticesService.findById.mockResolvedValue({
      id: 'practice-1',
      code: 'CHANGE_CONTROL',
      name: 'Change control',
      description: null,
    });
    repository.getNextAreaCode.mockResolvedValue('AREA_CHANGE');
    repository.create.mockResolvedValue(existingArea);

    await expect(
      service.create(
        {
          title: 'Change Area',
          teamId: 'team-1',
          ownerId: 'owner-1',
          itilPracticeId: 'practice-1',
          description: 'Area description',
        },
        currentUser,
      ),
    ).resolves.toEqual(existingArea);

    expect(
      workflowAuthorizationService.assertSameTeamAsUser,
    ).toHaveBeenCalledWith('owner-1', currentUser);
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

  it('should reject create when owner does not exist', async () => {
    repository.teamExists.mockResolvedValue(true);
    repository.ownerExists.mockResolvedValue(false);

    await expect(
      service.create(
        {
          title: 'Change Area',
          description: 'Area description',
          teamId: 'team-1',
          ownerId: 'missing-owner',
          itilPracticeId: 'practice-1',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should reject create when ITIL practice does not exist', async () => {
    repository.ownerExists.mockResolvedValue(true);
    repository.teamExists.mockResolvedValue(true);
    repository.userBelongsToTeam.mockResolvedValue(true);
    itilPracticesService.findById.mockResolvedValue(null);

    await expect(
      service.create(
        {
          title: 'Change Area',
          description: 'Area description',
          teamId: 'team-1',
          ownerId: 'owner-1',
          itilPracticeId: 'missing-practice',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should list and get areas', async () => {
    repository.findAll.mockResolvedValue([existingArea]);
    repository.findById.mockResolvedValue(existingArea);

    await expect(service.list()).resolves.toEqual([existingArea]);
    await expect(service.getById('area-1')).resolves.toEqual(existingArea);
  });

  it('should reject getById when the area does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.getById('missing-area')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should validate changed ownerId and itilPracticeId during update', async () => {
    repository.findById.mockResolvedValue(existingArea);
    repository.findByCode.mockResolvedValue(null);
    repository.ownerExists.mockResolvedValue(true);
    repository.userBelongsToTeam.mockResolvedValue(true);
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

  it('should reject update when the changed owner does not exist', async () => {
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

  it('should reject update when the changed ITIL practice does not exist', async () => {
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

  it('should reject attempts to change the backend-generated area code', async () => {
    repository.findById.mockResolvedValue(existingArea);

    await expect(
      service.update(
        'area-1',
        {
          code: 'AREA_NEW',
        } as never,
        currentUser,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should write an audit row on update', async () => {
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

  it('should reject create when owner is not in the selected team', async () => {
    repository.ownerExists.mockResolvedValue(true);
    repository.teamExists.mockResolvedValue(true);
    repository.userBelongsToTeam.mockResolvedValue(false);

    await expect(
      service.create(
        {
          title: 'Change Area',
          description: 'Area description',
          teamId: 'team-1',
          ownerId: 'owner-9',
          itilPracticeId: 'practice-1',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject create when a non-editor attempts to manage areas', async () => {
    await expect(
      service.create(
        {
          title: 'Change Area',
          description: 'Area description',
          teamId: 'team-1',
          ownerId: 'owner-1',
          itilPracticeId: 'practice-1',
        },
        { ...currentUser, role: Role.REVIEWER },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should enforce same-team ownership on update using the effective owner', async () => {
    repository.findById.mockResolvedValue(existingArea);
    repository.update.mockResolvedValue(existingArea);

    await service.update('area-1', { title: 'Updated' }, currentUser);

    expect(
      workflowAuthorizationService.assertSameTeamAsUser,
    ).toHaveBeenCalledWith('owner-1', currentUser);
  });

  it('should delete an area and write an audit row', async () => {
    repository.findById.mockResolvedValue(existingArea);

    await expect(
      service.delete('area-1', currentUser),
    ).resolves.toBeUndefined();

    expect(
      workflowAuthorizationService.assertSameTeamAsUser,
    ).toHaveBeenCalledWith('owner-1', currentUser);
    expect(repository.delete).toHaveBeenCalledWith('area-1');
    expect(auditLogWriterService.create).toHaveBeenCalledWith({
      entityType: 'area',
      entityId: 'area-1',
      action: 'DELETE',
      actorId: 'user-1',
      reasonForChange: 'Deleted area via API',
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
    });
  });
});
