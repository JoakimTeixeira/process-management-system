export const ARCHITECTURE_STATES = ['AS-IS', 'TO-BE'] as const;

export type ArchitectureState = (typeof ARCHITECTURE_STATES)[number];
