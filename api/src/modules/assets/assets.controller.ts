import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import {
  ProcessVersionAssetParamDto,
  ProcessVersionIdParamDto,
} from '../../common/dto/uuid-param.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SWAGGER_BEARER_AUTH_NAME } from '../../common/swagger/swagger.constants';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AssetsService } from './assets.service';
import { CreateBpmnAssetDto } from './dto/create-bpmn-asset.dto';
import { AssetContentResponseDto } from './dto/asset-content-response.dto';
import { AssetResponseDto } from './dto/asset-response.dto';
import type { AssetRecord } from './assets.repository';

@ApiTags('assets')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@ApiUnauthorizedResponse({
  description: 'JWT bearer token is missing or invalid.',
})
@ApiForbiddenResponse({
  description:
    'The authenticated user does not have permission to access this endpoint.',
})
@ApiExtraModels(CreateBpmnAssetDto)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('process-versions/:processVersionId/assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @ApiOperation({ summary: 'Upload a BPMN asset for a process version' })
  @ApiParam({
    name: 'processVersionId',
    description: 'Parent process version UUID.',
    format: 'uuid',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(CreateBpmnAssetDto) },
        {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              format: 'binary',
              description: 'BPMN file to upload.',
            },
          },
          required: ['file'],
        },
      ],
    },
  })
  @ApiCreatedResponse({
    description: 'BPMN asset uploaded successfully.',
    type: AssetResponseDto,
  })
  @Roles(Role.EDITOR)
  @Post('bpmn')
  @UseInterceptors(FileInterceptor('file'))
  async createBpmnAsset(
    @Param() params: ProcessVersionIdParamDto,
    @Body() createBpmnAssetDto: CreateBpmnAssetDto,
    @UploadedFile()
    file: {
      buffer: Buffer;
      originalname?: string;
      mimetype?: string;
    },
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<AssetResponseDto> {
    return this.toDto(
      await this.assetsService.createBpmnAsset(
        params.processVersionId,
        createBpmnAssetDto,
        file,
        currentUser,
      ),
    );
  }

  @ApiOperation({ summary: 'List assets for a process version' })
  @ApiParam({
    name: 'processVersionId',
    description: 'Parent process version UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Assets attached to the requested process version.',
    type: AssetResponseDto,
    isArray: true,
  })
  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER)
  @Get()
  async listByProcessVersionId(
    @Param() params: ProcessVersionIdParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<AssetResponseDto[]> {
    const assets = await this.assetsService.listByProcessVersionId(
      params.processVersionId,
      currentUser,
    );

    return assets.map((asset) => this.toDto(asset));
  }

  @ApiOperation({ summary: 'Get the current asset for a process version' })
  @ApiParam({
    name: 'processVersionId',
    description: 'Parent process version UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description:
      'Current asset for the requested process version, if one exists.',
    type: AssetResponseDto,
  })
  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER)
  @Get('current')
  async getCurrentByProcessVersionId(
    @Param() params: ProcessVersionIdParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<AssetResponseDto | null> {
    const asset = await this.assetsService.getCurrentByProcessVersionId(
      params.processVersionId,
      currentUser,
    );

    return asset ? this.toDto(asset) : null;
  }

  @ApiOperation({ summary: 'Get decoded content for an asset' })
  @ApiParam({
    name: 'processVersionId',
    description: 'Parent process version UUID.',
    format: 'uuid',
  })
  @ApiParam({
    name: 'assetId',
    description: 'Asset UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Decoded content for the requested asset.',
    type: AssetContentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Asset not found.' })
  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER)
  @Get(':assetId/content')
  async getAssetContent(
    @Param() params: ProcessVersionAssetParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<AssetContentResponseDto> {
    return plainToInstance(
      AssetContentResponseDto,
      await this.assetsService.getAssetContent(
        params.processVersionId,
        params.assetId,
        currentUser,
      ),
    );
  }

  private toDto(asset: AssetRecord): AssetResponseDto {
    return plainToInstance(AssetResponseDto, asset);
  }
}
