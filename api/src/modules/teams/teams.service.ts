import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { isUniqueViolationError } from '../../common/utils/postgres-error.util';
import { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { CreateTeamDto } from './dto/create-team.dto';
import type { UpdateTeamDto } from './dto/update-team.dto';
import type { TeamRecord } from './teams.repository';
import { TeamsRepository } from './teams.repository';

@Injectable()
export class TeamsService {
  private static readonly DUPLICATE_TEAM_MESSAGE =
    'A Team with the same code or name already exists';

  constructor(
    private readonly teamsRepository: TeamsRepository,
    private readonly auditLogWriterService: AuditLogWriterService,
  ) {}

  async list(): Promise<TeamRecord[]> {
    return await this.teamsRepository.findAll();
  }

  async getById(id: string): Promise<TeamRecord> {
    const team = await this.teamsRepository.findById(id);

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async create(
    createTeamDto: CreateTeamDto,
    currentUser: AuthenticatedUser,
  ): Promise<TeamRecord> {
    try {
      const team = await this.teamsRepository.create({
        code: createTeamDto.code,
        name: createTeamDto.name,
        description: createTeamDto.description,
      });

      await this.auditLogWriterService.create({
        entityType: 'team',
        entityId: team.id,
        action: 'CREATE',
        actorId: currentUser.id,
        reasonForChange: 'Created team via SYSTEM_ADMIN',
        newData: team,
      });

      return team;
    } catch (error: unknown) {
      if (isUniqueViolationError(error)) {
        throw new ConflictException(TeamsService.DUPLICATE_TEAM_MESSAGE);
      }

      throw error;
    }
  }

  async update(
    id: string,
    updateTeamDto: UpdateTeamDto,
    currentUser: AuthenticatedUser,
  ): Promise<TeamRecord> {
    const currentRecord = await this.getById(id);
    const updateInput: {
      code?: string;
      name?: string;
      description?: string;
    } = {};

    if (
      updateTeamDto.code !== undefined &&
      updateTeamDto.code !== currentRecord.code
    ) {
      updateInput.code = updateTeamDto.code;
    }

    if (
      updateTeamDto.name !== undefined &&
      updateTeamDto.name !== currentRecord.name
    ) {
      updateInput.name = updateTeamDto.name;
    }

    if (
      updateTeamDto.description !== undefined &&
      updateTeamDto.description !== currentRecord.description
    ) {
      updateInput.description = updateTeamDto.description;
    }

    try {
      const updatedTeam = await this.teamsRepository.update(id, updateInput);

      await this.auditLogWriterService.create({
        entityType: 'team',
        entityId: updatedTeam.id,
        action: 'UPDATE',
        actorId: currentUser.id,
        reasonForChange: 'Updated team via SYSTEM_ADMIN',
        oldData: currentRecord,
        newData: updatedTeam,
      });

      return updatedTeam;
    } catch (error: unknown) {
      if (isUniqueViolationError(error)) {
        throw new ConflictException(TeamsService.DUPLICATE_TEAM_MESSAGE);
      }

      throw error;
    }
  }

  async deactivate(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<TeamRecord> {
    const currentRecord = await this.getById(id);
    const updatedTeam = await this.teamsRepository.deactivate(id);

    await this.auditLogWriterService.create({
      entityType: 'team',
      entityId: updatedTeam.id,
      action: 'STATE_CHANGE',
      actorId: currentUser.id,
      reasonForChange: 'Deactivated team via SYSTEM_ADMIN',
      oldData: currentRecord,
      newData: updatedTeam,
    });

    return updatedTeam;
  }
}
