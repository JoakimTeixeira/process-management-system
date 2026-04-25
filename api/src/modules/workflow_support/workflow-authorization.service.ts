import { ForbiddenException, Injectable } from '@nestjs/common';

import { SAME_TEAM_WORKFLOW_MESSAGE } from '../../common/constants/workflow.constants';
import type { SqlExecutor } from '../../common/types/sql-executor.type';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { WorkflowAuthorizationRepository } from './workflow-authorization.repository';

@Injectable()
export class WorkflowAuthorizationService {
  constructor(
    private readonly workflowAuthorizationRepository: WorkflowAuthorizationRepository,
  ) {}

  async assertSameTeamAsUser(
    ownerId: string,
    currentUser: AuthenticatedUser,
    executor?: SqlExecutor,
  ): Promise<void> {
    const ownerTeamId =
      await this.workflowAuthorizationRepository.findUserTeamId(
        ownerId,
        executor,
      );

    this.assertSameTeam(ownerTeamId, currentUser);
  }

  async assertSameTeamAsProcessOwner(
    processId: string,
    currentUser: AuthenticatedUser,
    executor?: SqlExecutor,
  ): Promise<void> {
    const ownerTeamId =
      await this.workflowAuthorizationRepository.findProcessOwnerTeamId(
        processId,
        executor,
      );

    this.assertSameTeam(ownerTeamId, currentUser);
  }

  async assertSameTeamAsProcessVersionOwner(
    processVersionId: string,
    currentUser: AuthenticatedUser,
    executor?: SqlExecutor,
  ): Promise<void> {
    const ownerTeamId =
      await this.workflowAuthorizationRepository.findProcessVersionOwnerTeamId(
        processVersionId,
        executor,
      );

    this.assertSameTeam(ownerTeamId, currentUser);
  }

  async assertSameTeamAsProcedureOwner(
    procedureId: string,
    currentUser: AuthenticatedUser,
    executor?: SqlExecutor,
  ): Promise<void> {
    const ownerTeamId =
      await this.workflowAuthorizationRepository.findProcedureOwnerTeamId(
        procedureId,
        executor,
      );

    this.assertSameTeam(ownerTeamId, currentUser);
  }

  private assertSameTeam(
    ownerTeamId: string | null,
    currentUser: AuthenticatedUser,
  ): void {
    if (
      !ownerTeamId ||
      !currentUser.team?.id ||
      ownerTeamId !== currentUser.team.id
    ) {
      throw new ForbiddenException(SAME_TEAM_WORKFLOW_MESSAGE);
    }
  }
}
