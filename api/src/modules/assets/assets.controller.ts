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
  ProcessVersionAssetParamDto,
  ProcessVersionIdParamDto,
} from '../../common/dto/uuid-param.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AssetsService } from './assets.service';
import { CreateBpmnAssetDto } from './dto/create-bpmn-asset.dto';
import { AssetContentResponseDto } from './dto/asset-content-response.dto';
import { AssetResponseDto } from './dto/asset-response.dto';
import type { AssetRecord } from './assets.repository';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('process-versions/:processVersionId/assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

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
