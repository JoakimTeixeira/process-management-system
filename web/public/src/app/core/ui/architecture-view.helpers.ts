import { ArchitectureState } from '../models/public-portal.models';

export type ArchitectureViewId = 'as-is' | 'to-be';

const ARCHITECTURE_PRESENTATION: Record<
  ArchitectureState,
  {
    viewId: ArchitectureViewId;
    label: 'Current State' | 'Target State';
    subtitle: 'Current State (AS-IS)' | 'Target State (TO-BE)';
  }
> = {
  'AS-IS': {
    viewId: 'as-is',
    label: 'Current State',
    subtitle: 'Current State (AS-IS)',
  },
  'TO-BE': {
    viewId: 'to-be',
    label: 'Target State',
    subtitle: 'Target State (TO-BE)',
  },
};

export function getArchitectureLabel(
  architectureState: ArchitectureState,
): 'Current State' | 'Target State' {
  return ARCHITECTURE_PRESENTATION[architectureState].label;
}

export function getArchitectureSubtitle(
  architectureState: ArchitectureState,
): 'Current State (AS-IS)' | 'Target State (TO-BE)' {
  return ARCHITECTURE_PRESENTATION[architectureState].subtitle;
}

export function getArchitectureViewId(
  architectureState: ArchitectureState,
): ArchitectureViewId {
  return ARCHITECTURE_PRESENTATION[architectureState].viewId;
}

export function getArchitectureState(viewId: ArchitectureViewId): ArchitectureState {
  return viewId === 'to-be' ? 'TO-BE' : 'AS-IS';
}

export function normalizeArchitectureViewId(
  value: string | null | undefined,
  fallback: ArchitectureViewId = 'as-is',
): ArchitectureViewId {
  return value === 'as-is' || value === 'to-be' ? value : fallback;
}
