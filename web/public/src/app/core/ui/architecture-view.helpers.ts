import { ArchitectureState } from '../models/public-portal.models';

export function getArchitectureLabel(
  architectureState: ArchitectureState,
): 'Current State' | 'Target State' {
  return architectureState === 'AS-IS' ? 'Current State' : 'Target State';
}

export function getArchitectureSubtitle(
  architectureState: ArchitectureState,
): 'Current State (AS-IS)' | 'Target State (TO-BE)' {
  return architectureState === 'AS-IS' ? 'Current State (AS-IS)' : 'Target State (TO-BE)';
}
