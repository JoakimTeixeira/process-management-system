import { PublicProcessDetail } from '../models/public-portal.models';

export function mapProcessDetailViewModel(detail: PublicProcessDetail | null) {
  return {
    currentState: detail?.versions.asIs ?? null,
    targetState: detail?.versions.toBe ?? null,
    hasCurrentState: detail?.versions.asIs !== null,
    hasTargetState: detail?.versions.toBe !== null,
    hasAnyArchitecture: detail?.versions.asIs !== null || detail?.versions.toBe !== null,
    canCompare: detail?.versions.asIs !== null && detail?.versions.toBe !== null,
  };
}
