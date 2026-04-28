import {
  Body,
  Controller,
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
import { CreateGlossaryTermDto } from './dto/create-glossary-term.dto';
import { GlossaryTermResponseDto } from './dto/glossary-term-response.dto';
import { PublicGlossaryResponseDto } from './dto/public-glossary-response.dto';
import { UpdateGlossaryTermDto } from './dto/update-glossary-term.dto';
import { GlossaryService } from './glossary.service';

@ApiTags('glossary')
@Controller()
export class GlossaryController {
  constructor(private readonly glossaryService: GlossaryService) {}

  @ApiOperation({ summary: 'Get the public glossary catalogue' })
  @ApiOkResponse({
    description: 'Public glossary terms and linked ITIL practices.',
    type: PublicGlossaryResponseDto,
  })
  @Get('public/glossary')
  async getPublicGlossary(): Promise<PublicGlossaryResponseDto> {
    return plainToInstance(
      PublicGlossaryResponseDto,
      await this.glossaryService.getPublicGlossary(),
    );
  }

  @ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'List glossary terms' })
  @ApiOkResponse({
    description: 'Glossary terms managed in the backoffice.',
    type: GlossaryTermResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT bearer token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description:
      'The authenticated user does not have permission to access this endpoint.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR)
  @Get('glossary')
  async listTerms(): Promise<GlossaryTermResponseDto[]> {
    return (await this.glossaryService.listTerms()).map((term) =>
      this.toGlossaryTermDto(term),
    );
  }

  @ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Get a glossary term by id' })
  @ApiParam({
    name: 'id',
    description: 'Glossary term UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Requested glossary term record.',
    type: GlossaryTermResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT bearer token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description:
      'The authenticated user does not have permission to access this endpoint.',
  })
  @ApiNotFoundResponse({ description: 'Glossary term not found.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR)
  @Get('glossary/:id')
  async getById(@Param() params: IdParamDto): Promise<GlossaryTermResponseDto> {
    return this.toGlossaryTermDto(
      await this.glossaryService.getById(params.id),
    );
  }

  @ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Create a glossary term' })
  @ApiBody({ type: CreateGlossaryTermDto })
  @ApiCreatedResponse({
    description: 'Glossary term created successfully.',
    type: GlossaryTermResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT bearer token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description:
      'The authenticated user does not have permission to access this endpoint.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR)
  @Post('glossary')
  async create(
    @Body() createDto: CreateGlossaryTermDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<GlossaryTermResponseDto> {
    return this.toGlossaryTermDto(
      await this.glossaryService.create(createDto, currentUser),
    );
  }

  @ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Update a glossary term' })
  @ApiParam({
    name: 'id',
    description: 'Glossary term UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateGlossaryTermDto })
  @ApiOkResponse({
    description: 'Glossary term updated successfully.',
    type: GlossaryTermResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT bearer token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description:
      'The authenticated user does not have permission to access this endpoint.',
  })
  @ApiNotFoundResponse({ description: 'Glossary term not found.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR)
  @Patch('glossary/:id')
  async update(
    @Param() params: IdParamDto,
    @Body() updateDto: UpdateGlossaryTermDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<GlossaryTermResponseDto> {
    return this.toGlossaryTermDto(
      await this.glossaryService.update(params.id, updateDto, currentUser),
    );
  }

  private toGlossaryTermDto(term: {
    id: string;
    term: string;
    definition: string;
    category: string | null;
    isPreferred: boolean;
    createdBy: string | null;
  }): GlossaryTermResponseDto {
    return plainToInstance(GlossaryTermResponseDto, term);
  }
}
