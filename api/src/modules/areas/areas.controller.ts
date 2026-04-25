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
import { AreaResponseDto } from './dto/area-response.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { AreasService } from './areas.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Roles(Role.EDITOR)
  @Post()
  async create(
    @Body() createAreaDto: CreateAreaDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<AreaResponseDto> {
    const area = await this.areasService.create(createAreaDto, currentUser);

    return this.toDto(area);
  }

  @Get()
  async list(): Promise<AreaResponseDto[]> {
    const areas = await this.areasService.list();

    return areas.map((area) => this.toDto(area));
  }

  @Get(':id')
  async getById(@Param() params: IdParamDto): Promise<AreaResponseDto> {
    const area = await this.areasService.getById(params.id);

    return this.toDto(area);
  }

  @Roles(Role.EDITOR)
  @Patch(':id')
  async update(
    @Param() params: IdParamDto,
    @Body() updateAreaDto: UpdateAreaDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<AreaResponseDto> {
    const area = await this.areasService.update(
      params.id,
      updateAreaDto,
      currentUser,
    );

    return this.toDto(area);
  }

  @Roles(Role.EDITOR)
  @Delete(':id')
  async delete(
    @Param() params: IdParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.areasService.delete(params.id, currentUser);
  }

  private toDto(area: {
    id: string;
    code: string;
    title: string;
    description: string | null;
    ownerId: string;
    itilPracticeId: string;
    itilPracticeName: string;
  }): AreaResponseDto {
    return plainToInstance(AreaResponseDto, {
      ...area,
      itilPractice: {
        id: area.itilPracticeId,
        name: area.itilPracticeName,
      },
    });
  }
}
