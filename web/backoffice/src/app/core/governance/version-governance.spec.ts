import { getVisibleLifecycleActions } from './version-governance';
import { ProcessVersionRecord } from '../models/backoffice.models';

function createVersion(
  partial: Partial<ProcessVersionRecord>,
): ProcessVersionRecord {
  return {
    id: 'version-1',
    processId: 'process-1',
    versionNumber: 1,
    lifecycleState: 'Draft',
    architectureState: 'AS-IS',
    title: 'Example',
    checklistCompleted: false,
    derivedFromVersionId: null,
    changeDescription: 'Change',
    reasonForChange: 'Reason',
    ...partial,
  };
}

describe('getVisibleLifecycleActions', () => {
  it('shows only submit for editors on draft versions', () => {
    expect(
      getVisibleLifecycleActions('EDITOR', createVersion({ lifecycleState: 'Draft' })).map(
        (action) => action.key,
      ),
    ).toEqual(['submit']);
  });

  it('shows only reviewer actions for in-review versions', () => {
    expect(
      getVisibleLifecycleActions('REVIEWER', createVersion({ lifecycleState: 'In Review' })).map(
        (action) => action.key,
      ),
    ).toEqual(['approve', 'reject']);
  });

  it('shows publish for approved publisher flow', () => {
    expect(
      getVisibleLifecycleActions('PUBLISHER', createVersion({ lifecycleState: 'Approved' })).map(
        (action) => action.key,
      ),
    ).toEqual(['publish']);
  });

  it('shows archive and promote for published TO-BE versions', () => {
    expect(
      getVisibleLifecycleActions(
        'PUBLISHER',
        createVersion({ lifecycleState: 'Published', architectureState: 'TO-BE' }),
      ).map((action) => action.key),
    ).toEqual(['archive', 'promote']);
  });

  it('hides all lifecycle actions for viewers and system admins', () => {
    expect(
      getVisibleLifecycleActions('VIEWER', createVersion({ lifecycleState: 'Draft' })),
    ).toEqual([]);
    expect(
      getVisibleLifecycleActions('SYSTEM_ADMIN', createVersion({ lifecycleState: 'Approved' })),
    ).toEqual([]);
  });
});
