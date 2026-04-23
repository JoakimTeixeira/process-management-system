import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

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

    return this.toAreaResponseDto(area);
  }

  @Get()
  async list(): Promise<AreaResponseDto[]> {
    const areas = await this.areasService.list();

    return areas.map((area) => this.toAreaResponseDto(area));
  }

  @Get(':id')
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<AreaResponseDto> {
    const area = await this.areasService.getById(id);

    return this.toAreaResponseDto(area);
  }

  @Roles(Role.EDITOR)
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateAreaDto: UpdateAreaDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<AreaResponseDto> {
    const area = await this.areasService.update(id, updateAreaDto, currentUser);

    return this.toAreaResponseDto(area);
  }

  private toAreaResponseDto(area: {
    id: string;
    code: string;
    title: string;
    description: string | null;
    ownerId: string;
    itilPracticeId: string;
    itilPracticeName: string;
  }): AreaResponseDto {
    return new AreaResponseDto({
      ...area,
      itilPractice: {
        id: area.itilPracticeId,
        name: area.itilPracticeName,
      },
    });
  }
}
