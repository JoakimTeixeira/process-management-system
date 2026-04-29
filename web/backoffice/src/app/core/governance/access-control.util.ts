import { computed, inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import {
  AppRole,
  ProcessRecord,
  ProcessVersionRecord,
} from '../models/backoffice.models';

/**
 * Shared access control utility for team-based governance.
 * Provides consistent access control logic across the backoffice.
 */
@Injectable({ providedIn: 'root' })
export class AccessControlUtil {
  private readonly auth = inject(AuthService);

  /**
   * Get the current user's team ID.
   */
  readonly currentUserTeamId = computed(() => this.auth.currentUser()?.team?.id ?? null);

  /**
   * Get the current user's role.
   */
  readonly currentUserRole = computed(() => this.auth.currentUser()?.role.name);

  /**
   * Check whether the current user may create or mutate a process record.
   * Only same-team EDITORs may manage processes in the backoffice.
   */
  canManageProcess(process: ProcessRecord | null): boolean {
    return this.currentUserRole() === 'EDITOR' && this.isSameTeam(process);
  }

  /**
   * Check whether the current user may create a new version for the process.
   * Only same-team EDITORs may create versions.
   */
  canCreateVersion(process: ProcessRecord | null): boolean {
    return this.currentUserRole() === 'EDITOR' && this.isSameTeam(process);
  }

  /**
   * Check whether the current user may directly edit/upload content for a version.
   * Direct mutation is limited to same-team EDITORs working on Draft versions.
   */
  canManageVersion(
    process: ProcessRecord | null,
    version: Pick<ProcessVersionRecord, 'lifecycleState'> | null,
  ): boolean {
    return (
      this.currentUserRole() === 'EDITOR' &&
      this.isSameTeam(process) &&
      version?.lifecycleState === 'Draft'
    );
  }

  /**
   * Check whether the current user may perform review actions on a version.
   * Review actions are limited to same-team REVIEWERs.
   */
  canReviewVersion(process: ProcessRecord | null): boolean {
    return this.currentUserRole() === 'REVIEWER' && this.isSameTeam(process);
  }

  /**
   * Get available teams for the current user (only their own team).
   */
  getAvailableTeams(allTeams: { id: string; name: string }[]): { id: string; name: string }[] {
    const currentUserTeamId = this.currentUserTeamId();

    if (!currentUserTeamId) {
      return [];
    }

    return allTeams.filter((team) => team.id === currentUserTeamId);
  }

  /**
   * Get the locked team ID for a process (either the process's team or the user's team for new processes).
   */
  getLockedTeamId(process: ProcessRecord | null): string {
    return process?.teamId ?? this.currentUserTeamId() ?? '';
  }

  /**
   * Check if the current user has a specific role.
   */
  hasRole(role: AppRole): boolean {
    return this.currentUserRole() === role;
  }

  /**
   * Check if the current user has any of the specified roles.
   */
  hasAnyRole(roles: AppRole[]): boolean {
    const currentRole = this.currentUserRole();
    return currentRole ? roles.includes(currentRole) : false;
  }

  private isSameTeam(process: ProcessRecord | null): boolean {
    const currentUserTeamId = this.currentUserTeamId();

    if (!currentUserTeamId) {
      return false;
    }

    return !process || process.teamId === currentUserTeamId;
  }
}
