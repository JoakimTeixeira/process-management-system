import { AppRole, ProcessVersionRecord } from '../models/backoffice.models';

export type LifecycleActionKey =
  | 'submit'
  | 'approve'
  | 'reject'
  | 'reopen'
  | 'publish'
  | 'archive'
  | 'promote';

export interface LifecycleActionDefinition {
  key: LifecycleActionKey;
  label: string;
  icon: string;
  reasonMode: 'optional' | 'required';
}

export function getVisibleLifecycleActions(
  role: AppRole | undefined,
  version: ProcessVersionRecord | null,
): LifecycleActionDefinition[] {
  if (!role || !version) {
    return [];
  }

  switch (role) {
    case 'EDITOR':
      return version.lifecycleState === 'Draft'
        ? [
            {
              key: 'submit',
              label: 'Submit for Review',
              icon: 'send',
              reasonMode: 'optional',
            },
          ]
        : [];
    case 'REVIEWER':
      if (version.lifecycleState === 'In Review') {
        return [
          {
            key: 'approve',
            label: 'Approve',
            icon: 'task_alt',
            reasonMode: 'optional',
          },
          {
            key: 'reject',
            label: 'Reject',
            icon: 'cancel',
            reasonMode: 'required',
          },
        ];
      }

      return version.lifecycleState === 'Approved'
        ? [
            {
              key: 'reopen',
              label: 'Reopen',
              icon: 'restart_alt',
              reasonMode: 'required',
            },
          ]
        : [];
    case 'PUBLISHER':
      if (version.lifecycleState === 'Approved') {
        return [
          {
            key: 'publish',
            label: 'Publish',
            icon: 'publish',
            reasonMode: 'optional',
          },
        ];
      }

      if (version.lifecycleState === 'Published') {
        const actions: LifecycleActionDefinition[] = [
          {
            key: 'archive',
            label: 'Archive',
            icon: 'inventory_2',
            reasonMode: 'required',
          },
        ];

        if (version.architectureState === 'TO-BE') {
          actions.push({
            key: 'promote',
            label: 'Promote',
            icon: 'trending_up',
            reasonMode: 'required',
          });
        }

        return actions;
      }

      return [];
    default:
      return [];
  }
}

export function canEditDraftVersion(
  role: AppRole | undefined,
  version: ProcessVersionRecord | null,
): boolean {
  return role === 'EDITOR' && version?.lifecycleState === 'Draft';
}

export function canUploadDraftBpmn(
  role: AppRole | undefined,
  version: ProcessVersionRecord | null,
): boolean {
  return canEditDraftVersion(role, version);
}

export function canAccessGovernanceHistory(role: AppRole | undefined): boolean {
  return role === 'EDITOR' || role === 'REVIEWER' || role === 'PUBLISHER';
}
