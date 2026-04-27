import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import {
  ArchitectureState,
  PublicAreaSummary,
  PublicCatalogSearchResult,
  PublicGlossaryResponse,
  PublicProcessDetail,
  PublicProcessHistoryItem,
  PublicProcessSummary,
  PublicProcedureDetail,
  PublicProcedureSummary,
} from '../models/public-portal.models';
import { PUBLIC_API_BASE_URL } from './public-api-base-url';

@Injectable({ providedIn: 'root' })
export class PublicPortalApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = PUBLIC_API_BASE_URL;

  listAreas() {
    return this.http.get<PublicAreaSummary[]>(`${this.baseUrl}/public/areas`);
  }

  listProcesses(filters: {
    search?: string;
    areaId?: string;
    architectures?: ArchitectureState[];
  }) {
    let params = new HttpParams();

    if (filters.search && filters.search.trim() !== '') {
      params = params.set('search', filters.search.trim());
    }

    if (filters.areaId) {
      params = params.set('areaId', filters.areaId);
    }

    if ((filters.architectures ?? []).length > 0) {
      params = params.set('architectures', filters.architectures!.join(','));
    }

    return this.http.get<PublicProcessSummary[]>(`${this.baseUrl}/public/processes`, {
      params,
    });
  }

  searchCatalog(filters: { search?: string }) {
    let params = new HttpParams();

    if (filters.search && filters.search.trim() !== '') {
      params = params.set('search', filters.search.trim());
    }

    return this.http.get<PublicCatalogSearchResult[]>(`${this.baseUrl}/public/search`, {
      params,
    });
  }

  getProcessDetail(processId: string) {
    return this.http.get<PublicProcessDetail>(`${this.baseUrl}/public/processes/${processId}`);
  }

  getProcessVersions(processId: string) {
    return this.http.get<PublicProcessHistoryItem[]>(
      `${this.baseUrl}/public/processes/${processId}/versions`,
    );
  }

  listProcedures() {
    return this.http.get<PublicProcedureSummary[]>(`${this.baseUrl}/public/procedures`);
  }

  searchProcedures(filters: { search?: string }) {
    let params = new HttpParams();

    if (filters.search && filters.search.trim() !== '') {
      params = params.set('search', filters.search.trim());
    }

    return this.http.get<PublicProcedureSummary[]>(`${this.baseUrl}/public/procedures`, {
      params,
    });
  }

  getProcedureDetail(procedureId: string) {
    return this.http.get<PublicProcedureDetail>(`${this.baseUrl}/public/procedures/${procedureId}`);
  }

  getGlossary() {
    return this.http.get<PublicGlossaryResponse>(`${this.baseUrl}/public/glossary`);
  }
}
