import { ArchitectureState } from '../models/public-portal.models';

export function mapSelectedArchitectureFilters(
  selectedArchitectures: readonly ArchitectureState[],
): string | null {
  if (selectedArchitectures.length === 0) {
    return null;
  }

  return [...new Set(selectedArchitectures)].join(',');
}
