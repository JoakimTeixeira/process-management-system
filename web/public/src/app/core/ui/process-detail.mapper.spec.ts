import { mapProcessDetailViewModel } from './process-detail.mapper';

describe('process-detail.mapper', () => {
  it('separates current, target, compare, and empty-state data', () => {
    const detail = {
      process: {
        id: 'process-1',
        code: 'PROC_CHANGE',
        title: 'Change management',
        description: null,
        area: { id: 'area-1', code: 'AREA_OPS', title: 'Operations' },
        itilPractice: {
          id: 'practice-1',
          code: 'CHANGE_ENABLEMENT',
          name: 'Change enablement',
        },
      },
      versions: {
        asIs: {
          id: 'version-1',
          processId: 'process-1',
          versionNumber: 1,
          architectureState: 'AS-IS' as const,
          title: 'Current',
          changeDescription: 'Current state',
          reasonForChange: 'Baseline',
          procedures: [],
          bpmnAsset: null,
        },
        toBe: null,
      },
    };

    expect(mapProcessDetailViewModel(detail)).toEqual({
      currentState: detail.versions.asIs,
      targetState: null,
      hasCurrentState: true,
      hasTargetState: false,
      hasAnyArchitecture: true,
      canCompare: false,
    });
  });
});
