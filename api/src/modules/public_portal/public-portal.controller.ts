import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { IdParamDto, ProcessIdParamDto } from '../../common/dto/uuid-param.dto';
import { PublicPortalService } from './public-portal.service';
import {
  PublicAreaSummaryResponseDto,
  PublicCatalogSearchResultResponseDto,
  PublicProcessDetailResponseDto,
  PublicProcessHistoryItemResponseDto,
  PublicProcessSummaryResponseDto,
  PublicProcedureDetailResponseDto,
  PublicProcedureSummaryResponseDto,
} from './dto/public-portal-response.dto';
import type { ArchitectureState } from './public-portal.types';

@ApiTags('public')
@Controller('public')
export class PublicPortalController {
  constructor(private readonly publicPortalService: PublicPortalService) {}

  @ApiOperation({ summary: 'List public areas' })
  @ApiOkResponse({
    description: 'Published areas available in the public portal.',
    type: PublicAreaSummaryResponseDto,
    isArray: true,
  })
  @Get('areas')
  async listAreas(): Promise<PublicAreaSummaryResponseDto[]> {
    return plainToInstance(
      PublicAreaSummaryResponseDto,
      await this.publicPortalService.listAreas(),
    );
  }

  @ApiOperation({ summary: 'List public processes' })
  @ApiQuery({
    name: 'search',
    description: 'Free-text search term applied to process code and title.',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'areaId',
    description: 'Area UUID used to filter the public process catalogue.',
    required: false,
    type: String,
    format: 'uuid',
  })
  @ApiQuery({
    name: 'architectures',
    description:
      'Comma-separated architecture states to include, for example AS-IS,TO-BE.',
    required: false,
    type: String,
    example: 'AS-IS,TO-BE',
  })
  @ApiOkResponse({
    description: 'Published processes matching the supplied filters.',
    type: PublicProcessSummaryResponseDto,
    isArray: true,
  })
  @Get('processes')
  async listProcesses(
    @Query('search') search?: string,
    @Query('areaId') areaId?: string,
    @Query('architectures') architectures?: string,
  ): Promise<PublicProcessSummaryResponseDto[]> {
    return plainToInstance(
      PublicProcessSummaryResponseDto,
      await this.publicPortalService.listProcesses({
        search,
        areaId,
        architectures: this.parseArchitectures(architectures),
      }),
    );
  }

  @ApiOperation({ summary: 'List public procedures' })
  @ApiQuery({
    name: 'search',
    description: 'Free-text search term applied to procedure code and title.',
    required: false,
    type: String,
  })
  @ApiOkResponse({
    description: 'Published procedures matching the supplied search term.',
    type: PublicProcedureSummaryResponseDto,
    isArray: true,
  })
  @Get('procedures')
  async listProcedures(
    @Query('search') search?: string,
  ): Promise<PublicProcedureSummaryResponseDto[]> {
    return plainToInstance(
      PublicProcedureSummaryResponseDto,
      await this.publicPortalService.listProcedures({
        search,
      }),
    );
  }

  @ApiOperation({ summary: 'Search the public catalogue' })
  @ApiQuery({
    name: 'search',
    description:
      'Free-text query applied across published areas, processes, procedures, and assets.',
    required: false,
    type: String,
  })
  @ApiOkResponse({
    description:
      'Matching public catalogue results. Returns an empty array when the search term is blank.',
    type: PublicCatalogSearchResultResponseDto,
    isArray: true,
  })
  @Get('search')
  async searchCatalog(
    @Query('search') search?: string,
  ): Promise<PublicCatalogSearchResultResponseDto[]> {
    return plainToInstance(
      PublicCatalogSearchResultResponseDto,
      await this.publicPortalService.searchCatalog({
        search,
      }),
    );
  }

  @ApiOperation({ summary: 'Get public process detail' })
  @ApiParam({
    name: 'processId',
    description: 'Published process UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description:
      'Published process detail including current AS-IS and TO-BE versions.',
    type: PublicProcessDetailResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Public process not found.' })
  @Get('processes/:processId')
  async getProcessDetail(
    @Param() params: ProcessIdParamDto,
  ): Promise<PublicProcessDetailResponseDto> {
    return plainToInstance(
      PublicProcessDetailResponseDto,
      await this.publicPortalService.getProcessDetail(params.processId),
    );
  }

  @ApiOperation({ summary: 'List published versions for a public process' })
  @ApiParam({
    name: 'processId',
    description: 'Published process UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Published version history for the requested public process.',
    type: PublicProcessHistoryItemResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Public process not found.' })
  @Get('processes/:processId/versions')
  async listProcessVersions(
    @Param() params: ProcessIdParamDto,
  ): Promise<PublicProcessHistoryItemResponseDto[]> {
    return plainToInstance(
      PublicProcessHistoryItemResponseDto,
      await this.publicPortalService.listProcessVersions(params.processId),
    );
  }

  @ApiOperation({ summary: 'Get published BPMN XML for a process version' })
  @ApiParam({
    name: 'id',
    description: 'Published process version UUID.',
    format: 'uuid',
  })
  @ApiProduces('application/xml')
  @ApiOkResponse({
    description:
      'Published BPMN XML document for the requested process version.',
    schema: {
      type: 'string',
      example:
        '<?xml version="1.0" encoding="UTF-8"?><definitions id="Definitions_1" />',
    },
  })
  @ApiNotFoundResponse({ description: 'Published BPMN asset not found.' })
  @Get('process-versions/:id/bpmn')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async getPublishedBpmnXml(@Param() params: IdParamDto): Promise<string> {
    return await this.publicPortalService.getPublishedBpmnXml(params.id);
  }

  @ApiOperation({ summary: 'Get public procedure detail' })
  @ApiParam({
    name: 'id',
    description: 'Published procedure UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Published procedure detail for the requested record.',
    type: PublicProcedureDetailResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Public procedure not found.' })
  @Get('procedures/:id')
  async getProcedureDetail(
    @Param() params: IdParamDto,
  ): Promise<PublicProcedureDetailResponseDto> {
    return plainToInstance(
      PublicProcedureDetailResponseDto,
      await this.publicPortalService.getProcedureDetail(params.id),
    );
  }

  private parseArchitectures(value?: string): ArchitectureState[] {
    if (!value) {
      return [];
    }

    const architectures = value
      .split(',')
      .map((item) => item.trim())
      .filter((item): item is ArchitectureState => {
        return item === 'AS-IS' || item === 'TO-BE';
      });

    return [...new Set(architectures)];
  }
}
