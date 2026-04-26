import { ForbiddenException } from '@nestjs/common';

import { WorkflowAuthorizationService } from './workflow-authorization.service';
import { WorkflowAuthorizationRepository } from './workflow-authorization.repository';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Role } from '../../common/enums/role.enum';

describe('WorkflowAuthorizationService', () => {
  let service: WorkflowAuthorizationService;
  let repository: Pick<
    WorkflowAuthorizationRepository,
    | 'findUserTeamId'
    | 'findProcessOwnerTeamId'
    | 'findProcessVersionOwnerTeamId'
    | 'findProcedureOwnerTeamId'
  > & {
    findUserTeamId: jest.Mock;
    findProcessOwnerTeamId: jest.Mock;
    findProcessVersionOwnerTeamId: jest.Mock;
    findProcedureOwnerTeamId: jest.Mock;
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

  beforeEach(() => {
    repository = {
      findUserTeamId: jest.fn(),
      findProcessOwnerTeamId: jest.fn(),
      findProcessVersionOwnerTeamId: jest.fn(),
      findProcedureOwnerTeamId: jest.fn(),
    };

    service = new WorkflowAuthorizationService(
      repository as unknown as WorkflowAuthorizationRepository,
    );
  });

  it('should pass when user and owner are in same team', async () => {
    repository.findUserTeamId.mockResolvedValue('team-1');

    await expect(
      service.assertSameTeamAsUser('owner-1', mockUser),
    ).resolves.not.toThrow();
  });

  it('should throw when owner team is null', async () => {
    repository.findUserTeamId.mockResolvedValue(null);

    await expect(
      service.assertSameTeamAsUser('owner-1', mockUser),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw when user has no team', async () => {
    const userWithoutTeam: AuthenticatedUser = {
      ...mockUser,
      team: null,
    };

    repository.findUserTeamId.mockResolvedValue('team-1');

    await expect(
      service.assertSameTeamAsUser('owner-1', userWithoutTeam),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw when teams do not match', async () => {
    repository.findUserTeamId.mockResolvedValue('team-2');

    await expect(
      service.assertSameTeamAsUser('owner-1', mockUser),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should pass for process owner in same team', async () => {
    repository.findProcessOwnerTeamId.mockResolvedValue('team-1');

    await expect(
      service.assertSameTeamAsProcessOwner('process-1', mockUser),
    ).resolves.not.toThrow();
  });

  it('should throw for process owner in different team', async () => {
    repository.findProcessOwnerTeamId.mockResolvedValue('team-2');

    await expect(
      service.assertSameTeamAsProcessOwner('process-1', mockUser),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should pass for process version owner in same team', async () => {
    repository.findProcessVersionOwnerTeamId.mockResolvedValue('team-1');

    await expect(
      service.assertSameTeamAsProcessVersionOwner('version-1', mockUser),
    ).resolves.not.toThrow();
  });

  it('should throw for process version owner in different team', async () => {
    repository.findProcessVersionOwnerTeamId.mockResolvedValue('team-2');

    await expect(
      service.assertSameTeamAsProcessVersionOwner('version-1', mockUser),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should pass for procedure owner in same team', async () => {
    repository.findProcedureOwnerTeamId.mockResolvedValue('team-1');

    await expect(
      service.assertSameTeamAsProcedureOwner('procedure-1', mockUser),
    ).resolves.not.toThrow();
  });

  it('should throw for procedure owner in different team', async () => {
    repository.findProcedureOwnerTeamId.mockResolvedValue('team-2');

    await expect(
      service.assertSameTeamAsProcedureOwner('procedure-1', mockUser),
    ).rejects.toThrow(ForbiddenException);
  });
});
