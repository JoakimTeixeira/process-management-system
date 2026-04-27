import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { IdParamDto } from '../../common/dto/uuid-param.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateProcessDto } from './dto/create-process.dto';
import { ProcessResponseDto } from './dto/process-response.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import type { ProcessRecord } from './processes.repository';
import { ProcessesService } from './processes.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('processes')
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @Roles(Role.EDITOR)
  @Post()
  async create(
    @Body() createProcessDto: CreateProcessDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessResponseDto> {
    return this.toDto(
      await this.processesService.create(createProcessDto, currentUser),
    );
  }

  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER)
  @Get()
  async list(): Promise<ProcessResponseDto[]> {
    const processes = await this.processesService.list();

    return processes.map((process) => this.toDto(process));
  }

  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER)
  @Get(':id')
  async getById(@Param() params: IdParamDto): Promise<ProcessResponseDto> {
    return this.toDto(await this.processesService.getById(params.id));
  }

  @Roles(Role.EDITOR)
  @Patch(':id')
  async update(
    @Param() params: IdParamDto,
    @Body() updateProcessDto: UpdateProcessDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessResponseDto> {
    return this.toDto(
      await this.processesService.update(
        params.id,
        updateProcessDto,
        currentUser,
      ),
    );
  }

  @Roles(Role.EDITOR)
  @Delete(':id')
  async delete(
    @Param() params: IdParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.processesService.delete(params.id, currentUser);
  }

  private toDto(process: ProcessRecord): ProcessResponseDto {
    return plainToInstance(ProcessResponseDto, process);
  }
}
