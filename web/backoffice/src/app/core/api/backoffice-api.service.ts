import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { BACKOFFICE_API_BASE_URL } from './backoffice-api-base-url';
import {
  AdminUser,
  AreaRecord,
  AssetContentRecord,
  AssetRecord,
  AuditLogRecord,
  CurrentUser,
  GlossaryResponse,
  ItilPractice,
  LoginResponse,
  OwnerOption,
  ProcedureRecord,
  ProcessRecord,
  ProcessVersionRecord,
  TeamOption,
  VersionStateHistoryRecord,
} from '../models/backoffice.models';

@Injectable({ providedIn: 'root' })
export class BackofficeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = BACKOFFICE_API_BASE_URL;

  login(payload: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload);
  }

  getMe() {
    return this.http.get<CurrentUser>(`${this.baseUrl}/auth/me`);
  }

  listItilPractices() {
    return this.http.get<ItilPractice[]>(`${this.baseUrl}/itil-practices`);
  }

  listAreas() {
    return this.http.get<AreaRecord[]>(`${this.baseUrl}/areas`);
  }

  getArea(id: string) {
    return this.http.get<AreaRecord>(`${this.baseUrl}/areas/${id}`);
  }

  createArea(payload: {
    title: string;
    description: string;
    teamId: string;
    ownerId: string;
    itilPracticeId: string;
  }) {
    return this.http.post<AreaRecord>(`${this.baseUrl}/areas`, payload);
  }

  updateArea(
    id: string,
    payload: Partial<{
      title: string;
      description: string;
      teamId: string;
      ownerId: string;
      itilPracticeId: string;
    }>,
  ) {
    return this.http.patch<AreaRecord>(`${this.baseUrl}/areas/${id}`, payload);
  }

  listProcesses() {
    return this.http.get<ProcessRecord[]>(`${this.baseUrl}/processes`);
  }

  getProcess(id: string) {
    return this.http.get<ProcessRecord>(`${this.baseUrl}/processes/${id}`);
  }

  createProcess(payload: {
    title: string;
    description: string;
    areaId: string;
    teamId: string;
    ownerId: string;
  }) {
    return this.http.post<ProcessRecord>(`${this.baseUrl}/processes`, payload);
  }

  updateProcess(
    id: string,
    payload: Partial<{
      title: string;
      description: string;
      areaId: string;
      teamId: string;
      ownerId: string;
    }>,
  ) {
    return this.http.patch<ProcessRecord>(`${this.baseUrl}/processes/${id}`, payload);
  }

  listProcessVersions(processId: string) {
    return this.http.get<ProcessVersionRecord[]>(
      `${this.baseUrl}/processes/${processId}/versions`,
    );
  }

  createProcessVersion(
    processId: string,
    payload: {
      architectureState: 'AS-IS' | 'TO-BE';
      title: string;
      changeDescription: string;
      reasonForChange: string;
      derivedFromVersionId?: string | null;
    },
  ) {
    return this.http.post<ProcessVersionRecord>(
      `${this.baseUrl}/processes/${processId}/versions`,
      payload,
    );
  }

  getVersion(id: string) {
    return this.http.get<ProcessVersionRecord>(`${this.baseUrl}/process-versions/${id}`);
  }

  updateVersion(
    id: string,
    payload: Partial<{
      architectureState: 'AS-IS' | 'TO-BE';
      title: string;
      changeDescription: string;
      reasonForChange: string;
      derivedFromVersionId: string | null;
      checklistCompleted: boolean;
    }>,
  ) {
    return this.http.patch<ProcessVersionRecord>(
      `${this.baseUrl}/process-versions/${id}`,
      payload,
    );
  }

  submitVersionForReview(id: string, reason?: string) {
    return this.http.post<ProcessVersionRecord>(
      `${this.baseUrl}/process-versions/${id}/submit-for-review`,
      reason ? { reason } : {},
    );
  }

  approveVersion(id: string, reason?: string) {
    return this.http.post<ProcessVersionRecord>(
      `${this.baseUrl}/process-versions/${id}/approve`,
      reason ? { reason } : {},
    );
  }

  rejectVersion(id: string, reason: string) {
    return this.http.post<ProcessVersionRecord>(
      `${this.baseUrl}/process-versions/${id}/reject`,
      { reason },
    );
  }

  reopenVersion(id: string, reason: string) {
    return this.http.post<ProcessVersionRecord>(
      `${this.baseUrl}/process-versions/${id}/reopen`,
      { reason },
    );
  }

  publishVersion(id: string, reason?: string) {
    return this.http.post<ProcessVersionRecord>(
      `${this.baseUrl}/process-versions/${id}/publish`,
      reason ? { reason } : {},
    );
  }

  archiveVersion(id: string, reason: string) {
    return this.http.post<ProcessVersionRecord>(
      `${this.baseUrl}/process-versions/${id}/archive`,
      { reason },
    );
  }

  promoteVersion(id: string, justification: string, title?: string) {
    return this.http.post<ProcessVersionRecord>(
      `${this.baseUrl}/process-versions/${id}/promote`,
      title ? { justification, title } : { justification },
    );
  }

  listAssets(processVersionId: string) {
    return this.http.get<AssetRecord[]>(
      `${this.baseUrl}/process-versions/${processVersionId}/assets`,
    );
  }

  listProcedures(processVersionId: string) {
    return this.http.get<ProcedureRecord[]>(
      `${this.baseUrl}/process-versions/${processVersionId}/procedures`,
    );
  }

  createProcedure(
    processVersionId: string,
    payload: {
      title: string;
      utility: string;
      warranty: string;
      outcome: string;
      policy: string;
      activities: {
        resource: string;
        serviceAction: string;
        workInstruction: string;
      }[];
      inputs: string[];
      outputs: string[];
    },
  ) {
    return this.http.post<ProcedureRecord>(
      `${this.baseUrl}/process-versions/${processVersionId}/procedures`,
      payload,
    );
  }

  updateProcedure(
    id: string,
    payload: Partial<{
      title: string;
      utility: string;
      warranty: string;
      outcome: string;
      policy: string;
      activities: {
        resource: string;
        serviceAction: string;
        workInstruction: string;
      }[];
      inputs: string[];
      outputs: string[];
    }>,
  ) {
    return this.http.patch<ProcedureRecord>(`${this.baseUrl}/procedures/${id}`, payload);
  }

  deleteProcedure(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/procedures/${id}`);
  }

  listAllProcedures() {
    return this.http.get<ProcedureRecord[]>(`${this.baseUrl}/procedures`);
  }

  uploadBpmnAsset(processVersionId: string, caption: string, file: File) {
    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('file', file);

    return this.http.post<AssetRecord>(
      `${this.baseUrl}/process-versions/${processVersionId}/assets/bpmn`,
      formData,
    );
  }

  getAssetContent(processVersionId: string, assetId: string) {
    return this.http.get<AssetContentRecord>(
      `${this.baseUrl}/process-versions/${processVersionId}/assets/${assetId}/content`,
    );
  }

  getVersionStateHistory(processVersionId: string) {
    return this.http.get<VersionStateHistoryRecord[]>(
      `${this.baseUrl}/process-versions/${processVersionId}/state-history`,
    );
  }

  getAuditLogs(entityType: string, entityId: string) {
    return this.http.get<AuditLogRecord[]>(
      `${this.baseUrl}/audit-logs/${entityType}/${entityId}`,
    );
  }

  getGlossary() {
    return this.http.get<GlossaryResponse>(`${this.baseUrl}/public/glossary`);
  }

  createGlossaryTerm(payload: {
    term: string;
    definition: string;
    category: string | null;
    isPreferred: boolean;
  }) {
    return this.http.post(`${this.baseUrl}/glossary`, payload);
  }

  updateGlossaryTerm(id: string, payload: {
    term: string;
    definition: string;
    category: string | null;
    isPreferred: boolean;
  }) {
    return this.http.patch(`${this.baseUrl}/glossary/${id}`, payload);
  }

  listOwnerOptions(teamId: string) {
    return this.http.get<OwnerOption[]>(
      `${this.baseUrl}/users/owner-options/team/${teamId}`,
    );
  }

  listUsers() {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/users`);
  }

  getUser(id: string) {
    return this.http.get<AdminUser>(`${this.baseUrl}/users/${id}`);
  }

  listTeamOptions() {
    return this.http.get<TeamOption[]>(`${this.baseUrl}/users/team-options`);
  }

  createUser(payload: {
    name: string;
    email: string;
    roleName: string;
    teamId: string;
    password: string;
  }) {
    return this.http.post<AdminUser>(`${this.baseUrl}/users`, payload);
  }

  updateUser(
    id: string,
    payload: Partial<{
      name: string;
      email: string;
      roleName: string;
      teamId: string;
      isActive: boolean;
    }>,
  ) {
    return this.http.patch<AdminUser>(`${this.baseUrl}/users/${id}`, payload);
  }

  deactivateUser(id: string) {
    return this.http.patch<AdminUser>(`${this.baseUrl}/users/${id}/deactivate`, {});
  }

  resetUserPassword(id: string, newPassword: string) {
    return this.http.patch<AdminUser>(`${this.baseUrl}/users/${id}/reset-password`, {
      newPassword,
    });
  }
}
