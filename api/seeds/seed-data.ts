export type ArchitectureState = 'AS-IS' | 'TO-BE';
export type LifecycleState =
  | 'Draft'
  | 'In Review'
  | 'Approved'
  | 'Published'
  | 'Archived';

export interface RoleSeed {
  name: string;
  description: string;
}

export interface TeamSeed {
  code: string;
  name: string;
  description: string;
  aliases: string[];
}

export interface UserSeed {
  email: string;
  name: string;
  roleName: string;
  teamCode: string;
}

export interface GlossaryTermSeed {
  term: string;
  definition: string;
  category: string;
}

export interface ItilPracticeSeed {
  code: string;
  name: string;
  description: string;
}

export interface AreaSeed {
  code: string;
  title: string;
  description: string;
  itilPracticeCode: string;
  ownerEmail: string;
}

export interface ProcessSeed {
  code: string;
  title: string;
  summary: string;
  areaCode: string;
  ownerEmail: string;
}

export interface ProcessVersionSeed {
  processCode: string;
  versionNumber: number;
  architectureState: ArchitectureState;
  lifecycleState: LifecycleState;
  title: string;
  summary: string;
  checklistCompleted: boolean;
  changeDescription: string;
  reasonForChange: string;
  overview?: string;
  notes?: string;
  derivedFromVersionNumber?: number;
  updatedByEmail: string;
}

export interface ProcedureSeed {
  processCode: string;
  versionNumber: number;
  code: string;
  title: string;
  summary: string;
  purpose: string;
  scope: string;
  ownerEmail: string;
}

export interface VersionHistorySeed {
  processCode: string;
  versionNumber: number;
  fromState: LifecycleState | null;
  toState: LifecycleState;
  actorEmail: string;
  reason: string;
}

export interface BpmnAssetSeed {
  processCode: string;
  versionNumber: number;
  code: string;
  subtitle: string;
}

export interface AuditLogSeed {
  entityType: string;
  entityRef: string;
  action:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'STATE_CHANGE'
    | 'APPROVE'
    | 'REJECT'
    | 'PUBLISH'
    | 'ARCHIVE'
    | 'UPLOAD'
    | 'PROMOTE'
    | 'USER_CREATE'
    | 'USER_UPDATE'
    | 'USER_DEACTIVATE'
    | 'ROLE_ASSIGN'
    | 'TEAM_CHANGE';
  actorEmail: string;
  reasonForChange: string;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
}

export const SHARED_DEMO_PASSWORD = 'ProcessMVP!2026';
export const SEED_REASON_PREFIX = '[seed]';
export const BPMN_DIRECTORY = 'seed';

export const roles: RoleSeed[] = [
  {
    name: 'EDITOR',
    description:
      'Content preparation role for draft creation and BPMN uploads.',
  },
  {
    name: 'REVIEWER',
    description: 'Formal validation role separated from publication authority.',
  },
  {
    name: 'PUBLISHER',
    description: 'Controlled release authority for publication and archival.',
  },
  {
    name: 'VIEWER',
    description: 'Read-only consultation role for internal stakeholders.',
  },
  {
    name: 'SYSTEM_ADMIN',
    description: 'Technical operations role without governance authority.',
  },
];

export const teams: TeamSeed[] = [
  {
    code: 'PROCESS_OFFICE',
    name: 'Process Office',
    description: 'Coordinates process design and repository upkeep.',
    aliases: ['Process Governance Office'],
  },
  {
    code: 'QUALITY_AND_COMPLIANCE',
    name: 'Quality and Compliance',
    description: 'Reviews compliance and formal validation outcomes.',
    aliases: ['Quality Compliance'],
  },
  {
    code: 'RELEASE_GOVERNANCE_BOARD',
    name: 'Release Governance Board',
    description: 'Controls official publication and archival decisions.',
    aliases: [],
  },
  {
    code: 'ENTERPRISE_ARCHITECTURE',
    name: 'Enterprise Architecture',
    description:
      'Consults architecture views and published repository content.',
    aliases: [],
  },
  {
    code: 'PLATFORM_OPERATIONS',
    name: 'Platform Operations',
    description: 'Maintains platform availability and technical user support.',
    aliases: ['Platform Ops'],
  },
];

export const users: UserSeed[] = [
  {
    email: 'editor@pms.local',
    name: 'Elena Editor',
    roleName: 'EDITOR',
    teamCode: 'PROCESS_OFFICE',
  },
  {
    email: 'reviewer@pms.local',
    name: 'Ravi Reviewer',
    roleName: 'REVIEWER',
    teamCode: 'QUALITY_AND_COMPLIANCE',
  },
  {
    email: 'publisher@pms.local',
    name: 'Paula Publisher',
    roleName: 'PUBLISHER',
    teamCode: 'RELEASE_GOVERNANCE_BOARD',
  },
  {
    email: 'viewer@pms.local',
    name: 'Victor Viewer',
    roleName: 'VIEWER',
    teamCode: 'ENTERPRISE_ARCHITECTURE',
  },
  {
    email: 'system_administrator@pms.local',
    name: 'Sam System Administrator',
    roleName: 'SYSTEM_ADMIN',
    teamCode: 'PLATFORM_OPERATIONS',
  },
];

export const glossaryTerms: GlossaryTermSeed[] = [
  {
    term: 'AS-IS',
    definition:
      'Current institutional process state that is formally implemented and published.',
    category: 'Architecture State',
  },
  {
    term: 'TO-BE',
    definition:
      'Target future institutional process state proposed for governed improvement.',
    category: 'Architecture State',
  },
  {
    term: 'Process',
    definition:
      'Managed sequence of activities that transforms inputs into governed business outcomes.',
    category: 'Repository Structure',
  },
  {
    term: 'Procedure',
    definition:
      'Version-specific set of instructions that describes how a process is executed in practice.',
    category: 'Repository Structure',
  },
  {
    term: 'Business Process Model and Notation',
    definition:
      'Standard visual notation used to document and render business workflow diagrams in the repository.',
    category: 'Standards',
  },
];

export const itilPractices: ItilPracticeSeed[] = [
  {
    code: 'INCIDENT_MANAGEMENT',
    name: 'Incident management',
    description:
      'Restores normal service operation after disruptions and supports operational recovery.',
  },
  {
    code: 'CHANGE_CONTROL',
    name: 'Change control',
    description:
      'Controls assessment, authorization, and release of changes into the environment.',
  },
  {
    code: 'SERVICE_REQUEST_MANAGEMENT',
    name: 'Service request management',
    description:
      'Handles predefined user requests through standard fulfillment pathways.',
  },
];

export const areas: AreaSeed[] = [
  {
    code: 'AREA_OPERATIONAL_SUPPORT',
    title: 'Operational Support and Recovery',
    description:
      'Area that groups operational recovery and service stabilization processes.',
    itilPracticeCode: 'INCIDENT_MANAGEMENT',
    ownerEmail: 'editor@pms.local',
  },
  {
    code: 'AREA_CHANGE_PLANNING',
    title: 'Change Planning and Control',
    description:
      'Area that groups governance and planning activities for controlled change.',
    itilPracticeCode: 'CHANGE_CONTROL',
    ownerEmail: 'editor@pms.local',
  },
];

export const processes: ProcessSeed[] = [
  {
    code: 'PROCESS_INCIDENT_RESOLUTION',
    title: 'Incident Resolution Lifecycle',
    summary:
      'Standardizes diagnosis, escalation, and recovery of operational incidents.',
    areaCode: 'AREA_OPERATIONAL_SUPPORT',
    ownerEmail: 'editor@pms.local',
  },
  {
    code: 'PROCESS_STANDARD_CHANGE',
    title: 'Standard Change Governance',
    summary:
      'Controls review, approval, and publication of standardized operational changes.',
    areaCode: 'AREA_CHANGE_PLANNING',
    ownerEmail: 'editor@pms.local',
  },
];

export const processVersions: ProcessVersionSeed[] = [
  {
    processCode: 'PROCESS_INCIDENT_RESOLUTION',
    versionNumber: 1,
    architectureState: 'AS-IS',
    lifecycleState: 'Published',
    title: 'Incident Resolution Lifecycle Version 1',
    summary: 'Published current-state operating model for incident resolution.',
    checklistCompleted: true,
    changeDescription:
      'Baseline published incident-resolution workflow captured for current operations.',
    reasonForChange:
      'Establish the initial official AS-IS repository version for public consultation.',
    overview:
      'This version describes the current institutional incident recovery flow.',
    notes: 'Published baseline used for AS-IS portal comparison.',
    updatedByEmail: 'publisher@pms.local',
  },
  {
    processCode: 'PROCESS_INCIDENT_RESOLUTION',
    versionNumber: 2,
    architectureState: 'TO-BE',
    lifecycleState: 'Published',
    title: 'Incident Resolution Lifecycle Version 2',
    summary:
      'Published target-state workflow for faster triage and escalation.',
    checklistCompleted: true,
    changeDescription:
      'Introduces the published TO-BE process with clearer triage and governed escalation.',
    reasonForChange:
      'Provide a published TO-BE comparison target for the public portal and BPMN viewer.',
    overview:
      'This version models the future-state incident resolution pathway after improvement.',
    notes: 'Published comparison record and promotable TO-BE input state.',
    derivedFromVersionNumber: 1,
    updatedByEmail: 'publisher@pms.local',
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 1,
    architectureState: 'AS-IS',
    lifecycleState: 'Approved',
    title: 'Standard Change Governance Version 1',
    summary: 'Approved current-state governance flow awaiting publication.',
    checklistCompleted: true,
    changeDescription:
      'Captures the approved AS-IS standard change governance workflow.',
    reasonForChange:
      'Provide an approved record that is immediately publish-ready for demo purposes.',
    overview:
      'This version is approved and available for a later PUBLISHER action in demos.',
    notes: 'Approved workflow demo case.',
    updatedByEmail: 'reviewer@pms.local',
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 2,
    architectureState: 'TO-BE',
    lifecycleState: 'Draft',
    title: 'Standard Change Governance Version 2',
    summary:
      'Submit-ready draft target-state for the interactive lifecycle demo.',
    checklistCompleted: true,
    changeDescription:
      'Defines a TO-BE governance draft prepared for submit-for-review demonstration.',
    reasonForChange:
      'Provide a clean draft version that can move through review and publication during demos.',
    overview:
      'This draft is fully prepared with metadata and BPMN so the EDITOR can submit it immediately.',
    notes: 'Interactive lifecycle demo draft.',
    derivedFromVersionNumber: 1,
    updatedByEmail: 'editor@pms.local',
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 3,
    architectureState: 'TO-BE',
    lifecycleState: 'Draft',
    title: 'Standard Change Governance Version 3',
    summary: 'Rejected draft retained as evidence of formal review rejection.',
    checklistCompleted: true,
    changeDescription:
      'Creates a TO-BE candidate that will be formally rejected back to Draft.',
    reasonForChange:
      'Provide explicit rejection-path evidence in audit and lifecycle history.',
    overview:
      'This record demonstrates the formal In Review to Draft rejection flow.',
    notes: 'Rejection evidence case.',
    derivedFromVersionNumber: 1,
    updatedByEmail: 'reviewer@pms.local',
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 4,
    architectureState: 'AS-IS',
    lifecycleState: 'Draft',
    title: 'Standard Change Governance Version 4',
    summary: 'Reopened version retained as evidence of controlled rework.',
    checklistCompleted: true,
    changeDescription:
      'Creates an AS-IS version that is approved and then formally reopened to Draft.',
    reasonForChange:
      'Provide explicit controlled-reopening evidence in audit and lifecycle history.',
    overview:
      'This record demonstrates Approved to Draft reopening under reviewer control.',
    notes: 'Controlled reopening evidence case.',
    derivedFromVersionNumber: 1,
    updatedByEmail: 'reviewer@pms.local',
  },
];

export const procedures: ProcedureSeed[] = [
  {
    processCode: 'PROCESS_INCIDENT_RESOLUTION',
    versionNumber: 1,
    code: 'PROCEDURE_INCIDENT_TRIAGE_BASELINE',
    title: 'Baseline Incident Triage Procedure',
    summary:
      'Defines the current-state triage checkpoints for incident recovery.',
    purpose: 'Classify and route incidents under the published AS-IS workflow.',
    scope: 'Applies to operational incidents documented in Version 1.',
    ownerEmail: 'editor@pms.local',
  },
  {
    processCode: 'PROCESS_INCIDENT_RESOLUTION',
    versionNumber: 2,
    code: 'PROCEDURE_INCIDENT_TRIAGE_TARGET',
    title: 'Target Incident Triage Procedure',
    summary:
      'Defines the target-state triage checkpoints for the TO-BE workflow.',
    purpose:
      'Support faster escalation and governed handoff in the TO-BE flow.',
    scope: 'Applies to the published TO-BE process structure in Version 2.',
    ownerEmail: 'editor@pms.local',
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 2,
    code: 'PROCEDURE_STANDARD_CHANGE_DRAFT',
    title: 'Draft Standard Change Preparation Procedure',
    summary:
      'Defines the draft-level preparation steps for the interactive workflow demo.',
    purpose:
      'Demonstrate that procedures are version-specific and editable in Draft.',
    scope: 'Applies only to the submit-ready Draft Version 2.',
    ownerEmail: 'editor@pms.local',
  },
];

export const versionStateHistory: VersionHistorySeed[] = [
  {
    processCode: 'PROCESS_INCIDENT_RESOLUTION',
    versionNumber: 1,
    fromState: null,
    toState: 'Draft',
    actorEmail: 'editor@pms.local',
    reason: `${SEED_REASON_PREFIX} Initial draft creation for the AS-IS baseline.`,
  },
  {
    processCode: 'PROCESS_INCIDENT_RESOLUTION',
    versionNumber: 1,
    fromState: 'Draft',
    toState: 'In Review',
    actorEmail: 'editor@pms.local',
    reason: `${SEED_REASON_PREFIX} Submitted baseline AS-IS version for formal review.`,
  },
  {
    processCode: 'PROCESS_INCIDENT_RESOLUTION',
    versionNumber: 1,
    fromState: 'In Review',
    toState: 'Approved',
    actorEmail: 'reviewer@pms.local',
    reason: `${SEED_REASON_PREFIX} Reviewer validated the AS-IS baseline.`,
  },
  {
    processCode: 'PROCESS_INCIDENT_RESOLUTION',
    versionNumber: 1,
    fromState: 'Approved',
    toState: 'Published',
    actorEmail: 'publisher@pms.local',
    reason: `${SEED_REASON_PREFIX} Publisher released the AS-IS baseline.`,
  },
  {
    processCode: 'PROCESS_INCIDENT_RESOLUTION',
    versionNumber: 2,
    fromState: null,
    toState: 'Draft',
    actorEmail: 'editor@pms.local',
    reason: `${SEED_REASON_PREFIX} Initial draft creation for the TO-BE target state.`,
  },
  {
    processCode: 'PROCESS_INCIDENT_RESOLUTION',
    versionNumber: 2,
    fromState: 'Draft',
    toState: 'In Review',
    actorEmail: 'editor@pms.local',
    reason: `${SEED_REASON_PREFIX} Submitted TO-BE target version for formal review.`,
  },
  {
    processCode: 'PROCESS_INCIDENT_RESOLUTION',
    versionNumber: 2,
    fromState: 'In Review',
    toState: 'Approved',
    actorEmail: 'reviewer@pms.local',
    reason: `${SEED_REASON_PREFIX} Reviewer approved the TO-BE target version.`,
  },
  {
    processCode: 'PROCESS_INCIDENT_RESOLUTION',
    versionNumber: 2,
    fromState: 'Approved',
    toState: 'Published',
    actorEmail: 'publisher@pms.local',
    reason: `${SEED_REASON_PREFIX} Publisher released the TO-BE target version.`,
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 1,
    fromState: null,
    toState: 'Draft',
    actorEmail: 'editor@pms.local',
    reason: `${SEED_REASON_PREFIX} Initial draft creation for the approved AS-IS workflow.`,
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 1,
    fromState: 'Draft',
    toState: 'In Review',
    actorEmail: 'editor@pms.local',
    reason: `${SEED_REASON_PREFIX} Submitted AS-IS workflow for review.`,
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 1,
    fromState: 'In Review',
    toState: 'Approved',
    actorEmail: 'reviewer@pms.local',
    reason: `${SEED_REASON_PREFIX} Reviewer approved the AS-IS workflow.`,
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 2,
    fromState: null,
    toState: 'Draft',
    actorEmail: 'editor@pms.local',
    reason: `${SEED_REASON_PREFIX} Interactive lifecycle draft prepared for submit-for-review demo.`,
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 3,
    fromState: null,
    toState: 'Draft',
    actorEmail: 'editor@pms.local',
    reason: `${SEED_REASON_PREFIX} Draft created for the rejection evidence path.`,
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 3,
    fromState: 'Draft',
    toState: 'In Review',
    actorEmail: 'editor@pms.local',
    reason: `${SEED_REASON_PREFIX} Submitted rejection evidence version for formal review.`,
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 3,
    fromState: 'In Review',
    toState: 'Draft',
    actorEmail: 'reviewer@pms.local',
    reason: `${SEED_REASON_PREFIX} Reviewer rejected the version and returned it to Draft.`,
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 4,
    fromState: null,
    toState: 'Draft',
    actorEmail: 'editor@pms.local',
    reason: `${SEED_REASON_PREFIX} Draft created for controlled reopening evidence.`,
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 4,
    fromState: 'Draft',
    toState: 'In Review',
    actorEmail: 'editor@pms.local',
    reason: `${SEED_REASON_PREFIX} Submitted reopening evidence version for formal review.`,
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 4,
    fromState: 'In Review',
    toState: 'Approved',
    actorEmail: 'reviewer@pms.local',
    reason: `${SEED_REASON_PREFIX} Reviewer approved the reopening evidence version.`,
  },
  {
    processCode: 'PROCESS_STANDARD_CHANGE',
    versionNumber: 4,
    fromState: 'Approved',
    toState: 'Draft',
    actorEmail: 'reviewer@pms.local',
    reason: `${SEED_REASON_PREFIX} Reviewer formally reopened the approved version to Draft.`,
  },
];

export const bpmnAssets: BpmnAssetSeed[] = processVersions.map((version) => ({
  processCode: version.processCode,
  versionNumber: version.versionNumber,
  code: `${version.processCode}_V${version.versionNumber}_BPMN`,
  subtitle: `${version.title} BPMN Diagram`,
}));

export const auditLogs: AuditLogSeed[] = [
  ...users.map((user) => ({
    entityType: 'user',
    entityRef: user.email,
    action: 'USER_CREATE' as const,
    actorEmail: 'system_administrator@pms.local',
    reasonForChange: `${SEED_REASON_PREFIX} Created seeded user ${user.email}.`,
    newData: {
      email: user.email,
      role: user.roleName,
      team: user.teamCode,
      isActive: true,
    },
  })),
  ...areas.map((area) => ({
    entityType: 'area',
    entityRef: area.code,
    action: 'CREATE' as const,
    actorEmail: 'editor@pms.local',
    reasonForChange: `${SEED_REASON_PREFIX} Created seeded area ${area.code}.`,
    newData: {
      code: area.code,
      title: area.title,
      ownerEmail: area.ownerEmail,
    },
  })),
  ...processes.map((process) => ({
    entityType: 'process',
    entityRef: process.code,
    action: 'CREATE' as const,
    actorEmail: 'editor@pms.local',
    reasonForChange: `${SEED_REASON_PREFIX} Created seeded process ${process.code}.`,
    newData: {
      code: process.code,
      title: process.title,
      ownerEmail: process.ownerEmail,
    },
  })),
  ...processVersions.map((version) => ({
    entityType: 'process_version',
    entityRef: `${version.processCode}@${version.versionNumber}`,
    action: 'CREATE' as const,
    actorEmail: 'editor@pms.local',
    reasonForChange: `${SEED_REASON_PREFIX} Created seeded version ${version.processCode}@${version.versionNumber}.`,
    newData: {
      processCode: version.processCode,
      versionNumber: version.versionNumber,
      lifecycleState: version.lifecycleState,
      architectureState: version.architectureState,
    },
  })),
  {
    entityType: 'process_version',
    entityRef: 'PROCESS_INCIDENT_RESOLUTION@1',
    action: 'APPROVE',
    actorEmail: 'reviewer@pms.local',
    reasonForChange: `${SEED_REASON_PREFIX} Reviewer approved PROCESS_INCIDENT_RESOLUTION Version 1.`,
  },
  {
    entityType: 'process_version',
    entityRef: 'PROCESS_INCIDENT_RESOLUTION@1',
    action: 'PUBLISH',
    actorEmail: 'publisher@pms.local',
    reasonForChange: `${SEED_REASON_PREFIX} Publisher released PROCESS_INCIDENT_RESOLUTION Version 1.`,
  },
  {
    entityType: 'process_version',
    entityRef: 'PROCESS_INCIDENT_RESOLUTION@2',
    action: 'APPROVE',
    actorEmail: 'reviewer@pms.local',
    reasonForChange: `${SEED_REASON_PREFIX} Reviewer approved PROCESS_INCIDENT_RESOLUTION Version 2.`,
  },
  {
    entityType: 'process_version',
    entityRef: 'PROCESS_INCIDENT_RESOLUTION@2',
    action: 'PUBLISH',
    actorEmail: 'publisher@pms.local',
    reasonForChange: `${SEED_REASON_PREFIX} Publisher released PROCESS_INCIDENT_RESOLUTION Version 2.`,
  },
  {
    entityType: 'process_version',
    entityRef: 'PROCESS_STANDARD_CHANGE@1',
    action: 'APPROVE',
    actorEmail: 'reviewer@pms.local',
    reasonForChange: `${SEED_REASON_PREFIX} Reviewer approved PROCESS_STANDARD_CHANGE Version 1.`,
  },
  {
    entityType: 'process_version',
    entityRef: 'PROCESS_STANDARD_CHANGE@3',
    action: 'REJECT',
    actorEmail: 'reviewer@pms.local',
    reasonForChange: `${SEED_REASON_PREFIX} Reviewer rejected PROCESS_STANDARD_CHANGE Version 3.`,
  },
  {
    entityType: 'process_version',
    entityRef: 'PROCESS_STANDARD_CHANGE@4',
    action: 'STATE_CHANGE',
    actorEmail: 'reviewer@pms.local',
    reasonForChange: `${SEED_REASON_PREFIX} Reviewer reopened PROCESS_STANDARD_CHANGE Version 4 to Draft.`,
  },
];
