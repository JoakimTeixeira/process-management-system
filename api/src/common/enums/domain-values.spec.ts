import {
  ARCHITECTURE_STATES,
  ArchitectureState,
} from './architecture-state.enum';
import { CATALOG_KINDS, CatalogKind } from './catalog-kind.enum';
import { LIFECYCLE_STATES, LifecycleState } from './lifecycle-state.enum';

describe('canonical domain values', () => {
  it('should expose persisted lifecycle state spellings in workflow order', () => {
    expect(LIFECYCLE_STATES).toEqual([
      'Draft',
      'In Review',
      'Approved',
      'Published',
      'Archived',
    ] satisfies LifecycleState[]);
  });

  it('should expose persisted architecture state spellings', () => {
    expect(ARCHITECTURE_STATES).toEqual([
      'AS-IS',
      'TO-BE',
    ] satisfies ArchitectureState[]);
  });

  it('should expose the public catalog kinds', () => {
    expect(CATALOG_KINDS).toEqual([
      'Area',
      'Process',
      'Procedure',
      'Asset',
    ] satisfies CatalogKind[]);
  });
});
