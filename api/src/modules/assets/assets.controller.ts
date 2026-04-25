import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { ProcessVersionIdParamDto } from '../../common/dto/uuid-param.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AssetsService } from './assets.service';
import { CreateBpmnAssetDto } from './dto/create-bpmn-asset.dto';
import { AssetResponseDto } from './dto/asset-response.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('process-versions/:processVersionId/assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Roles(Role.EDITOR)
  @Post('bpmn')
  async createBpmnAsset(
    @Param() params: ProcessVersionIdParamDto,
    @Body() createBpmnAssetDto: CreateBpmnAssetDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<AssetResponseDto> {
    return new AssetResponseDto(
      await this.assetsService.createBpmnAsset(
        params.processVersionId,
        createBpmnAssetDto,
        currentUser,
      ),
    );
  }

  @Get()
  async listByProcessVersionId(
    @Param() params: ProcessVersionIdParamDto,
  ): Promise<AssetResponseDto[]> {
    const assets = await this.assetsService.listByProcessVersionId(
      params.processVersionId,
    );

    return assets.map((asset) => new AssetResponseDto(asset));
  }
}
