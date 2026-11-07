export const LIFECYCLE_STATES = [
  'Draft',
  'In Review',
  'Approved',
  'Published',
  'Archived',
] as const;

export type LifecycleState = (typeof LIFECYCLE_STATES)[number];

export const PUBLIC_LIFECYCLE_STATES = [
  LIFECYCLE_STATES[3],
  LIFECYCLE_STATES[4],
] as const;

export type PublicLifecycleState = (typeof PUBLIC_LIFECYCLE_STATES)[number];
