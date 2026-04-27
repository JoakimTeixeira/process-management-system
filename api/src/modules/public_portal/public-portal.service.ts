import { Injectable, NotFoundException } from '@nestjs/common';

import { PublicCatalogRepository } from './public-catalog.repository';
import {
  mapAreaSummary,
  mapCatalogSearchResult,
  mapProcessDetail,
  mapProcessHistoryItem,
  mapProcessSummary,
  mapProcessVersionView,
  mapProcedureDetail,
  mapProcedureSummary,
} from './public-portal.mapper';
import { PublicPortalAssetsService } from './public-portal-assets.service';
import { PublicProcessesRepository } from './public-processes.repository';
import { PublicProceduresRepository } from './public-procedures.repository';
import type {
  ArchitectureState,
  PublicAreaSummary,
  PublicCatalogSearchFilters,
  PublicCatalogSearchResult,
  PublicProcessDetail,
  PublicProcessFilters,
  PublicProcessHistoryItem,
  PublicProcessSummary,
  PublicProcessVersionView,
  PublicProcedureDetail,
  PublicProcedureFilters,
  PublicProcedureSummary,
} from './public-portal.types';

@Injectable()
export class PublicPortalService {
  constructor(
    private readonly publicCatalogRepository: PublicCatalogRepository,
    private readonly publicProcessesRepository: PublicProcessesRepository,
    private readonly publicProceduresRepository: PublicProceduresRepository,
    private readonly publicPortalAssetsService: PublicPortalAssetsService,
  ) {}

  async listAreas(): Promise<PublicAreaSummary[]> {
    const rows = await this.publicCatalogRepository.listAreas();
    return rows.map(mapAreaSummary);
  }

  async listProcesses(
    filters: PublicProcessFilters,
  ): Promise<PublicProcessSummary[]> {
    const rows = await this.publicProcessesRepository.listProcesses(filters);
    return rows.map(mapProcessSummary);
  }

  async listProcedures(
    filters: PublicProcedureFilters,
  ): Promise<PublicProcedureSummary[]> {
    const rows = await this.publicProceduresRepository.listProcedures(filters);
    return rows.map(mapProcedureSummary);
  }

  async searchCatalog(
    filters: PublicCatalogSearchFilters,
  ): Promise<PublicCatalogSearchResult[]> {
    const searchTerm = filters.search?.trim();

    if (!searchTerm) {
      return [];
    }

    const rows = await this.publicCatalogRepository.searchCatalog(searchTerm);
    return rows.map(mapCatalogSearchResult);
  }

  async getProcessDetail(processId: string): Promise<PublicProcessDetail> {
    const process =
      await this.publicProcessesRepository.findPublicProcessBase(processId);

    if (!process) {
      throw new NotFoundException('Public process not found');
    }

    const [asIsRow, toBeRow] = await Promise.all([
      this.publicProcessesRepository.findPublishedProcessVersion(
        processId,
        'AS-IS',
      ),
      this.publicProcessesRepository.findPublishedProcessVersion(
        processId,
        'TO-BE',
      ),
    ]);

    const [asIs, toBe] = await Promise.all([
      this.hydratePublishedProcessVersion(asIsRow),
      this.hydratePublishedProcessVersion(toBeRow),
    ]);

    return mapProcessDetail(process, {
      asIs,
      toBe,
    });
  }

  async listProcessVersions(
    processId: string,
  ): Promise<PublicProcessHistoryItem[]> {
    const process =
      await this.publicProcessesRepository.findPublicProcessBase(processId);

    if (!process) {
      throw new NotFoundException('Public process not found');
    }

    const rows =
      await this.publicProcessesRepository.listProcessVersions(processId);
    return rows.map(mapProcessHistoryItem);
  }

  async getPublishedBpmnXml(processVersionId: string): Promise<string> {
    const asset =
      await this.publicProcessesRepository.findPublishedBpmnAsset(
        processVersionId,
      );

    if (!asset) {
      throw new NotFoundException('Published BPMN asset not found');
    }

    return await this.publicPortalAssetsService.readPublishedBpmnXml(
      asset.file_path,
    );
  }

  async getProcedureDetail(
    procedureId: string,
  ): Promise<PublicProcedureDetail> {
    const row =
      await this.publicProceduresRepository.findProcedureDetail(procedureId);

    if (!row) {
      throw new NotFoundException('Public procedure not found');
    }

    return mapProcedureDetail(row);
  }

  private async hydratePublishedProcessVersion(
    version: {
      id: string;
      process_id: string;
      version_number: number;
      architecture_state: ArchitectureState;
      title: string;
      change_description: string;
      reason_for_change: string;
      asset_id: string | null;
      asset_caption: string | null;
    } | null,
  ): Promise<PublicProcessVersionView | null> {
    if (!version) {
      return null;
    }

    const procedureRows =
      await this.publicProceduresRepository.listPublishedProceduresByVersionId(
        version.id,
      );

    return mapProcessVersionView(
      version,
      procedureRows.map(mapProcedureSummary),
    );
  }
}
