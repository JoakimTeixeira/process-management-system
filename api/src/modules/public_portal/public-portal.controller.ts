import { Controller, Get, Header, Param, Query } from '@nestjs/common';

import { IdParamDto, ProcessIdParamDto } from '../../common/dto/uuid-param.dto';
import { PublicPortalService } from './public-portal.service';
import type {
  PublicAreaSummary,
  PublicCatalogSearchResult,
  PublicProcessDetail,
  PublicProcessHistoryItem,
  PublicProcessSummary,
  PublicProcedureDetail,
  PublicProcedureSummary,
} from './public-portal.types';

@Controller('public')
export class PublicPortalController {
  constructor(private readonly publicPortalService: PublicPortalService) {}

  @Get('areas')
  async listAreas(): Promise<PublicAreaSummary[]> {
    return await this.publicPortalService.listAreas();
  }

  @Get('processes')
  async listProcesses(
    @Query('search') search?: string,
    @Query('areaId') areaId?: string,
    @Query('architectures') architectures?: string,
  ): Promise<PublicProcessSummary[]> {
    return await this.publicPortalService.listProcesses({
      search,
      areaId,
      architectures: this.parseArchitectures(architectures),
    });
  }

  @Get('procedures')
  async listProcedures(
    @Query('search') search?: string,
  ): Promise<PublicProcedureSummary[]> {
    return await this.publicPortalService.listProcedures({
      search,
    });
  }

  @Get('search')
  async searchCatalog(
    @Query('search') search?: string,
  ): Promise<PublicCatalogSearchResult[]> {
    return await this.publicPortalService.searchCatalog({
      search,
    });
  }

  @Get('processes/:processId')
  async getProcessDetail(
    @Param() params: ProcessIdParamDto,
  ): Promise<PublicProcessDetail> {
    return await this.publicPortalService.getProcessDetail(params.processId);
  }

  @Get('processes/:processId/versions')
  async listProcessVersions(
    @Param() params: ProcessIdParamDto,
  ): Promise<PublicProcessHistoryItem[]> {
    return await this.publicPortalService.listProcessVersions(params.processId);
  }

  @Get('process-versions/:id/bpmn')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async getPublishedBpmnXml(@Param() params: IdParamDto): Promise<string> {
    return await this.publicPortalService.getPublishedBpmnXml(params.id);
  }

  @Get('procedures/:id')
  async getProcedureDetail(
    @Param() params: IdParamDto,
  ): Promise<PublicProcedureDetail> {
    return await this.publicPortalService.getProcedureDetail(params.id);
  }

  private parseArchitectures(value?: string): Array<'AS-IS' | 'TO-BE'> {
    if (!value) {
      return [];
    }

    const architectures = value
      .split(',')
      .map((item) => item.trim())
      .filter((item): item is 'AS-IS' | 'TO-BE' => {
        return item === 'AS-IS' || item === 'TO-BE';
      });

    return [...new Set(architectures)];
  }
}
