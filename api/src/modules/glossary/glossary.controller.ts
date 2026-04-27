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

import { IdParamDto } from '../../common/dto/uuid-param.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type {
  CreateGlossaryTermDto,
  PublicGlossaryResponse,
  UpdateGlossaryTermDto,
} from './glossary.service';
import { GlossaryService } from './glossary.service';
import type { GlossaryTermRecord } from './glossary.repository';

@Controller()
export class GlossaryController {
  constructor(private readonly glossaryService: GlossaryService) {}

  @Get('public/glossary')
  async getPublicGlossary(): Promise<PublicGlossaryResponse> {
    return await this.glossaryService.getPublicGlossary();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR)
  @Get('glossary')
  async listTerms(): Promise<GlossaryTermRecord[]> {
    return await this.glossaryService.listTerms();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR)
  @Get('glossary/:id')
  async getById(@Param() params: IdParamDto): Promise<GlossaryTermRecord> {
    return await this.glossaryService.getById(params.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR)
  @Post('glossary')
  async create(
    @Body() createDto: CreateGlossaryTermDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<GlossaryTermRecord> {
    return await this.glossaryService.create(createDto, currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR)
  @Patch('glossary/:id')
  async update(
    @Param() params: IdParamDto,
    @Body() updateDto: UpdateGlossaryTermDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<GlossaryTermRecord> {
    return await this.glossaryService.update(params.id, updateDto, currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR)
  @Delete('glossary/:id')
  async delete(
    @Param() params: IdParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.glossaryService.delete(params.id, currentUser);
  }
}
