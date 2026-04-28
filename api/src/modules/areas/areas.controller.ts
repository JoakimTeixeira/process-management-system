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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { IdParamDto } from '../../common/dto/uuid-param.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SWAGGER_BEARER_AUTH_NAME } from '../../common/swagger/swagger.constants';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AreaResponseDto } from './dto/area-response.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { AreasService } from './areas.service';

@ApiTags('areas')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@ApiUnauthorizedResponse({
  description: 'JWT bearer token is missing or invalid.',
})
@ApiForbiddenResponse({
  description:
    'The authenticated user does not have permission to access this endpoint.',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @ApiOperation({ summary: 'Create an area' })
  @ApiBody({ type: CreateAreaDto })
  @ApiCreatedResponse({
    description: 'Area created successfully.',
    type: AreaResponseDto,
  })
  @Roles(Role.EDITOR)
  @Post()
  async create(
    @Body() createAreaDto: CreateAreaDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<AreaResponseDto> {
    const area = await this.areasService.create(createAreaDto, currentUser);

    return this.toDto(area);
  }

  @ApiOperation({ summary: 'List areas' })
  @ApiOkResponse({
    description: 'Areas accessible to the authenticated user.',
    type: AreaResponseDto,
    isArray: true,
  })
  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER)
  @Get()
  async list(): Promise<AreaResponseDto[]> {
    const areas = await this.areasService.list();

    return areas.map((area) => this.toDto(area));
  }

  @ApiOperation({ summary: 'Get an area by id' })
  @ApiParam({
    name: 'id',
    description: 'Area UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Requested area record.',
    type: AreaResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Area not found.' })
  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER)
  @Get(':id')
  async getById(@Param() params: IdParamDto): Promise<AreaResponseDto> {
    const area = await this.areasService.getById(params.id);

    return this.toDto(area);
  }

  @ApiOperation({ summary: 'Update an area' })
  @ApiParam({
    name: 'id',
    description: 'Area UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateAreaDto })
  @ApiOkResponse({
    description: 'Area updated successfully.',
    type: AreaResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Area not found.' })
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

  @ApiOperation({
    summary: 'Delete an area',
    description:
      'Deletes an area only when it has no processes. This operation is audited and returns 409 if dependent processes still exist.',
  })
  @ApiParam({
    name: 'id',
    description: 'Area UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Area deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Area not found.' })
  @ApiConflictResponse({
    description:
      'Area cannot be deleted while it still contains processes or other business rules prevent the deletion.',
  })
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
    teamId: string;
    teamName: string;
    ownerId: string;
    ownerName: string;
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
