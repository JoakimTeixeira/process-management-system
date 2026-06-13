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
  description: string;
  areaCode: string;
  ownerEmail: string;
}

export interface ProcessVersionSeed {
  processCode: string;
  versionNumber: number;
  architectureState: ArchitectureState;
  lifecycleState: LifecycleState;
  title: string;
  checklistCompleted: boolean;
  changeDescription: string;
  reasonForChange: string;
  derivedFromVersionRef?: string;
  updatedByEmail: string;
}

export interface ProcedureActivitySeed {
  resource: string;
  service_action: string;
  work_instruction: string;
}

export interface ProcedureSeed {
  processCode: string;
  versionNumber: number;
  code: string;
  title: string;
  utility: string;
  warranty: string;
  outcome: string;
  policy: string;
  activities: ProcedureActivitySeed[];
  inputs: string[];
  outputs: string[];
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
  caption: string;
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
    | 'REOPEN'
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

export const BPMN_DIRECTORY = 'seed';

export const roles: RoleSeed[] = [
  {
    name: 'EDITOR',
    description:
      'Responsible for preparing and modifying process content in draft state.',
  },
  {
    name: 'REVIEWER',
    description:
      'Responsible for formal validation, rejection, and controlled reopening.',
  },
  {
    name: 'PUBLISHER',
    description:
      'Responsible for publication, archival, and TO-BE promotion decisions.',
  },
  {
    name: 'VIEWER',
    description: 'Authenticated read-only consultation role.',
  },
  {
    name: 'SYSTEM_ADMIN',
    description: 'Technical administration role with no governance authority.',
  },
];

export const teams: TeamSeed[] = [
  {
    code: 'HR',
    name: 'Human Resources',
    description:
      'Human resources department responsible for relocation workflows.',
    aliases: ['People Operations'],
  },
  {
    code: 'IT',
    name: 'Information Technology',
    description:
      'IT department responsible for technical infrastructure and support.',
    aliases: ['Tech Operations'],
  },
];

export const users: UserSeed[] = [
  {
    email: 'alice.editor@example.com',
    name: 'Alice Editor',
    roleName: 'EDITOR',
    teamCode: 'HR',
  },
  {
    email: 'rachel.reviewer@example.com',
    name: 'Rachel Reviewer',
    roleName: 'REVIEWER',
    teamCode: 'HR',
  },
  {
    email: 'peter.publisher@example.com',
    name: 'Peter Publisher',
    roleName: 'PUBLISHER',
    teamCode: 'HR',
  },
  {
    email: 'victor.viewer@example.com',
    name: 'Victor Viewer',
    roleName: 'VIEWER',
    teamCode: 'IT',
  },
  {
    email: 'sam.admin@example.com',
    name: 'Sam SystemAdmin',
    roleName: 'SYSTEM_ADMIN',
    teamCode: 'IT',
  },
];

export const glossaryTerms: GlossaryTermSeed[] = [
  {
    term: 'AS-IS',
    definition:
      'Current officially published state of an institutional process.',
    category: 'Architecture State',
  },
  {
    term: 'TO-BE',
    definition:
      'Target future state of an institutional process proposed for improvement.',
    category: 'Architecture State',
  },
  {
    term: 'Process',
    definition:
      'Stable workflow identity that can accumulate governed versions over time.',
    category: 'Repository Structure',
  },
  {
    term: 'Procedure',
    definition:
      'Version-specific operational steps and structured metadata used to execute a process.',
    category: 'Repository Structure',
  },
  {
    term: 'Business Process Model and Notation',
    definition:
      'Standard notation used to document and visualize business workflow diagrams.',
    category: 'Standards',
  },
  {
    term: 'Utility',
    definition:
      'The functionality offered by a product or service to meet a particular need. Utility can be summarized as "what the service does" and can be used to determine whether a service is "fit for purpose".',
    category: 'ITIL 4',
  },
  {
    term: 'Warranty',
    definition:
      'Assurance that a product or service will meet agreed requirements. Warranty can be summarized as "how the service performs" and can be used to determine whether a service is "fit for use". The framework specifies that warranty typically addresses areas such as availability of the service, its capacity, levels of security, and continuity.',
    category: 'ITIL 4',
  },
  {
    term: 'Outcome',
    definition: 'A result for a stakeholder enabled by one or more outputs.',
    category: 'ITIL 4',
  },
  {
    term: 'Policy',
    definition:
      'Formally documented management expectations and intentions, used to direct decisions and activities.',
    category: 'ITIL 4',
  },
  {
    term: 'Resource',
    definition:
      'A person, or other entity, that is required for the execution of an activity.',
    category: 'ITIL 4',
  },
  {
    term: 'Service Action',
    definition: 'Any action required to deliver a service output to a user.',
    category: 'ITIL 4',
  },
  {
    term: 'Work Instruction',
    definition:
      'A detailed description to be followed in order to perform an activity.',
    category: 'ITIL 4',
  },
  {
    term: 'Output',
    definition: 'A tangible or intangible deliverable of an activity.',
    category: 'ITIL 4',
  },
];

export const itilPractices: ItilPracticeSeed[] = [
  {
    code: 'APO07',
    name: 'Managed Human Resources',
    description:
      'Optimize human resources capabilities to meet enterprise objectives.',
  },
  {
    code: 'APO04',
    name: 'Managed Quality',
    description:
      'Ensure that products and services meet established quality standards and stakeholder expectations.',
  },
];

export const areas: AreaSeed[] = [
  {
    code: 'A1',
    title: 'Global Management',
    description:
      'Business area containing the human resources relocation and allocation workflows.',
    itilPracticeCode: 'APO07',
    ownerEmail: 'alice.editor@example.com',
  },
  {
    code: 'A2',
    title: 'Quality Assurance',
    description:
      'Business area containing quality management and compliance workflows.',
    itilPracticeCode: 'APO04',
    ownerEmail: 'sam.admin@example.com',
  },
];

export const processes: ProcessSeed[] = [
  {
    code: '1',
    title: 'Employee Workplace Relocation',
    description:
      'End-to-end workflow for relocating employees between office locations, including workspace allocation, equipment transfer, and administrative coordination.',
    areaCode: 'A1',
    ownerEmail: 'alice.editor@example.com',
  },
  {
    code: '2',
    title: 'Employee Onboarding and Allocation',
    description:
      'Workflow for integrating new employees into their assigned workplace, including workspace setup, access provisioning, and administrative registration.',
    areaCode: 'A1',
    ownerEmail: 'alice.editor@example.com',
  },
  {
    code: '3',
    title: 'Quality Compliance Review',
    description:
      'Workflow for reviewing and validating process compliance with established quality standards and regulatory requirements.',
    areaCode: 'A2',
    ownerEmail: 'sam.admin@example.com',
  },
];

export const processVersions: ProcessVersionSeed[] = [
  {
    processCode: '1',
    versionNumber: 1,
    architectureState: 'AS-IS',
    lifecycleState: 'Published',
    title: 'Employee Workplace Relocation v1.0',
    checklistCompleted: true,
    changeDescription:
      'Initial publication of the standard employee relocation workflow.',
    reasonForChange:
      'Document the existing relocation process to ensure consistency across all departments.',
    updatedByEmail: 'peter.publisher@example.com',
  },
  {
    processCode: '1',
    versionNumber: 2,
    architectureState: 'TO-BE',
    lifecycleState: 'Published',
    title: 'Employee Workplace Relocation v2.0 - Improved Coordination',
    checklistCompleted: true,
    changeDescription:
      'Redesigned workflow to reduce relocation time from 5 to 3 business days.',
    reasonForChange:
      'Stakeholder feedback indicated delays in equipment delivery and lack of coordination between departments.',
    derivedFromVersionRef: '1@1',
    updatedByEmail: 'peter.publisher@example.com',
  },
  {
    processCode: '1',
    versionNumber: 3,
    architectureState: 'TO-BE',
    lifecycleState: 'Draft',
    title: 'Employee Workplace Relocation v3.0 - Rejected Draft',
    checklistCompleted: false,
    changeDescription:
      'Proposed additional automation for relocation workflow.',
    reasonForChange:
      'Explore automation opportunities to further reduce relocation time.',
    derivedFromVersionRef: '1@2',
    updatedByEmail: 'alice.editor@example.com',
  },
  {
    processCode: '2',
    versionNumber: 1,
    architectureState: 'AS-IS',
    lifecycleState: 'Archived',
    title: 'Employee Onboarding and Allocation v1.0',
    checklistCompleted: true,
    changeDescription:
      'Initial publication of the standard employee onboarding process.',
    reasonForChange:
      'Establish a consistent onboarding procedure across all departments.',
    updatedByEmail: 'peter.publisher@example.com',
  },
  {
    processCode: '2',
    versionNumber: 2,
    architectureState: 'TO-BE',
    lifecycleState: 'Archived',
    title: 'Employee Onboarding and Allocation v2.0 - Streamlined Process',
    checklistCompleted: true,
    changeDescription:
      'Streamlined onboarding process to reduce first-day setup time from 4 to 2 hours.',
    reasonForChange:
      'New employee surveys indicated lengthy setup times and redundant paperwork.',
    derivedFromVersionRef: '2@1',
    updatedByEmail: 'peter.publisher@example.com',
  },
  {
    processCode: '2',
    versionNumber: 3,
    architectureState: 'AS-IS',
    lifecycleState: 'Published',
    title: 'Employee Onboarding and Allocation v3.0 - Current Standard',
    checklistCompleted: true,
    changeDescription:
      'Promoted the streamlined onboarding workflow to production as the new standard.',
    reasonForChange:
      'Successful pilot implementation demonstrated 50% reduction in first-day setup time.',
    derivedFromVersionRef: '2@2',
    updatedByEmail: 'peter.publisher@example.com',
  },
  {
    processCode: '2',
    versionNumber: 4,
    architectureState: 'TO-BE',
    lifecycleState: 'Approved',
    title: 'Employee Onboarding and Allocation v4.0 - AI-Assisted',
    checklistCompleted: true,
    changeDescription:
      'Proposed AI-assisted onboarding with predictive resource allocation.',
    reasonForChange:
      'Leverage machine learning to predict and pre-allocate resources based on new employee profile.',
    derivedFromVersionRef: '2@3',
    updatedByEmail: 'alice.editor@example.com',
  },
  {
    processCode: '3',
    versionNumber: 1,
    architectureState: 'AS-IS',
    lifecycleState: 'Published',
    title: 'Quality Compliance Review v1.0',
    checklistCompleted: true,
    changeDescription:
      'Initial publication of the standard quality compliance review workflow.',
    reasonForChange:
      'Establish a consistent quality review process across all departments.',
    updatedByEmail: 'peter.publisher@example.com',
  },
];

const comparisonActivities: ProcedureActivitySeed[] = [
  {
    resource: 'Human Resources Department',
    service_action: 'Issue Relocation Assignment',
    work_instruction:
      'Prepare and distribute the official relocation assignment document to the employee and destination office.',
  },
  {
    resource: 'Destination Office Administration',
    service_action: 'Prepare Workspace',
    work_instruction:
      'Allocate and prepare the physical workspace, including desk, chair, and necessary office supplies.',
  },
  {
    resource: 'IT Support Team',
    service_action: 'Configure IT Equipment',
    work_instruction:
      'Set up computer, network access, email account, and required business applications at the new location.',
  },
];

const targetActivities: ProcedureActivitySeed[] = [
  {
    resource: 'Human Resources Department',
    service_action: 'Issue Relocation Assignment',
    work_instruction:
      'Prepare and distribute the official relocation assignment document to the employee and destination office.',
  },
  {
    resource: 'Destination Office Manager',
    service_action: 'Confirm Workspace Readiness',
    work_instruction:
      'Verify workspace availability and confirm readiness date with HR and IT teams.',
  },
  {
    resource: 'IT Support Team',
    service_action: 'Pre-configure IT Environment',
    work_instruction:
      'Prepare user account, configure workstation, and test network access before employee arrival date.',
  },
];

const qualityReviewActivities: ProcedureActivitySeed[] = [
  {
    resource: 'Quality Assurance Team',
    service_action: 'Initiate Compliance Review',
    work_instruction:
      'Review process documentation against established quality standards and regulatory requirements.',
  },
  {
    resource: 'Process Owner',
    service_action: 'Provide Compliance Documentation',
    work_instruction:
      'Submit documentation demonstrating adherence to quality standards and process controls.',
  },
  {
    resource: 'Quality Assurance Team',
    service_action: 'Document Review Findings',
    work_instruction:
      'Record compliance assessment results and identify any required corrective actions.',
  },
];

export const procedures: ProcedureSeed[] = [
  {
    processCode: '1',
    versionNumber: 1,
    code: '1.1',
    title: 'Inter-Departmental Employee Transfer',
    utility:
      'Workflow functionality to facilitate the relocation of employees between supported office locations.',
    warranty:
      'Relocation completed within 5 business days, with zero data loss, and compliant with organization security policies.',
    outcome:
      'The employee is fully operational at their new location with configured IT equipment and workspace.',
    policy: 'Applies to staff transfers between supported office locations.',
    activities: comparisonActivities,
    inputs: ['Approved transfer request from department head'],
    outputs: [
      'Employee operational at new location with all required equipment and access',
    ],
  },
  {
    processCode: '1',
    versionNumber: 2,
    code: '1.1',
    title: 'Coordinated Employee Transfer Process',
    utility:
      'Workflow functionality to facilitate coordinated relocation with structured handoff across HR, receiving offices, and IT support.',
    warranty:
      'Relocation completed within 3 business days, with zero data loss, and compliant with organization security policies.',
    outcome:
      'The employee is activated at the destination office on the planned date with all services operational.',
    policy: 'Applies to staff transfers between supported office locations.',
    activities: targetActivities,
    inputs: [
      'Approved transfer request',
      'Destination office readiness confirmation',
    ],
    outputs: ['Employee activated at destination office on planned date'],
  },
  {
    processCode: '2',
    versionNumber: 1,
    code: '2.1',
    title: 'New Employee Onboarding Procedure',
    utility:
      'Workflow functionality to integrate new employees into their assigned workplace.',
    warranty:
      'Onboarding completed within 4 hours on first day, with zero data loss, and compliant with organization security policies.',
    outcome:
      'The new employee is fully operational with workspace, IT access, and administrative registration completed.',
    policy: 'Applies to all new hires across departments.',
    activities: comparisonActivities,
    inputs: ['Employment contract and HR onboarding checklist'],
    outputs: ['New employee operational with workspace and IT access'],
  },
  {
    processCode: '2',
    versionNumber: 2,
    code: '2.1',
    title: 'Streamlined New Employee Onboarding',
    utility:
      'Workflow functionality to integrate new employees with automated access provisioning and digital documentation.',
    warranty:
      'Onboarding completed within 2 hours on first day, with zero data loss, and compliant with organization security policies.',
    outcome:
      'The new employee is fully operational with pre-configured workspace and automated access.',
    policy: 'Applies to all new hires across departments.',
    activities: targetActivities,
    inputs: ['Employment contract and automated onboarding checklist'],
    outputs: ['New employee operational with pre-configured environment'],
  },
  {
    processCode: '2',
    versionNumber: 3,
    code: '2.1',
    title: 'Standard New Employee Onboarding Process',
    utility:
      'Workflow functionality to integrate new employees with automated access provisioning and digital documentation.',
    warranty:
      'Onboarding completed within 2 hours on first day, with zero data loss, and compliant with organization security policies.',
    outcome:
      'The new employee is fully operational with pre-configured workspace and automated access.',
    policy: 'Applies to all new hires across departments.',
    activities: targetActivities,
    inputs: ['Employment contract and automated onboarding checklist'],
    outputs: ['New employee operational with pre-configured environment'],
  },
  {
    processCode: '3',
    versionNumber: 1,
    code: '3.1',
    title: 'Process Quality Compliance Review',
    utility:
      'Workflow functionality to validate process compliance with established quality standards and regulatory requirements.',
    warranty:
      'Compliance review completed within 5 business days, with documented findings and corrective action recommendations.',
    outcome:
      'Process compliance status documented with clear pass/fail determination and required corrective actions identified.',
    policy:
      'Applies to all published processes requiring quality certification.',
    activities: qualityReviewActivities,
    inputs: ['Process documentation and quality standards checklist'],
    outputs: [
      'Compliance assessment findings and corrective action recommendations',
    ],
  },
];

export const versionStateHistory: VersionHistorySeed[] = [
  {
    processCode: '1',
    versionNumber: 1,
    fromState: null,
    toState: 'Draft',
    actorEmail: 'alice.editor@example.com',
    reason: 'Created initial draft of the employee relocation workflow.',
  },
  {
    processCode: '1',
    versionNumber: 1,
    fromState: 'Draft',
    toState: 'In Review',
    actorEmail: 'alice.editor@example.com',
    reason: 'Submitted the employee relocation workflow for formal review.',
  },
  {
    processCode: '1',
    versionNumber: 1,
    fromState: 'In Review',
    toState: 'Approved',
    actorEmail: 'rachel.reviewer@example.com',
    reason:
      'Approved the employee relocation workflow after validation review.',
  },
  {
    processCode: '1',
    versionNumber: 1,
    fromState: 'Approved',
    toState: 'Published',
    actorEmail: 'peter.publisher@example.com',
    reason:
      'Released the employee relocation workflow as the official standard.',
  },
  {
    processCode: '1',
    versionNumber: 2,
    fromState: null,
    toState: 'Draft',
    actorEmail: 'alice.editor@example.com',
    reason: 'Created initial draft of the improved relocation workflow.',
  },
  {
    processCode: '1',
    versionNumber: 2,
    fromState: 'Draft',
    toState: 'In Review',
    actorEmail: 'alice.editor@example.com',
    reason: 'Submitted the improved relocation workflow for formal review.',
  },
  {
    processCode: '1',
    versionNumber: 2,
    fromState: 'In Review',
    toState: 'Approved',
    actorEmail: 'rachel.reviewer@example.com',
    reason:
      'Approved the improved relocation workflow after validation review.',
  },
  {
    processCode: '1',
    versionNumber: 2,
    fromState: 'Approved',
    toState: 'Published',
    actorEmail: 'peter.publisher@example.com',
    reason:
      'Released the improved relocation workflow as the proposed target state.',
  },
  {
    processCode: '1',
    versionNumber: 3,
    fromState: null,
    toState: 'Draft',
    actorEmail: 'alice.editor@example.com',
    reason: 'Created initial draft of the automation proposal.',
  },
  {
    processCode: '1',
    versionNumber: 3,
    fromState: 'Draft',
    toState: 'In Review',
    actorEmail: 'alice.editor@example.com',
    reason: 'Submitted the automation proposal for formal review.',
  },
  {
    processCode: '1',
    versionNumber: 3,
    fromState: 'In Review',
    toState: 'Draft',
    actorEmail: 'rachel.reviewer@example.com',
    reason:
      'Rejected the automation proposal due to insufficient cost-benefit analysis and unclear ROI.',
  },
  {
    processCode: '2',
    versionNumber: 1,
    fromState: null,
    toState: 'Draft',
    actorEmail: 'alice.editor@example.com',
    reason: 'Created initial draft of the employee onboarding workflow.',
  },
  {
    processCode: '2',
    versionNumber: 1,
    fromState: 'Draft',
    toState: 'In Review',
    actorEmail: 'alice.editor@example.com',
    reason: 'Submitted the employee onboarding workflow for formal review.',
  },
  {
    processCode: '2',
    versionNumber: 1,
    fromState: 'In Review',
    toState: 'Approved',
    actorEmail: 'rachel.reviewer@example.com',
    reason:
      'Approved the employee onboarding workflow after validation review.',
  },
  {
    processCode: '2',
    versionNumber: 1,
    fromState: 'Approved',
    toState: 'Published',
    actorEmail: 'peter.publisher@example.com',
    reason:
      'Released the employee onboarding workflow as the official standard.',
  },
  {
    processCode: '2',
    versionNumber: 1,
    fromState: 'Published',
    toState: 'Archived',
    actorEmail: 'peter.publisher@example.com',
    reason:
      'Archived the original onboarding workflow after process improvement implementation.',
  },
  {
    processCode: '2',
    versionNumber: 2,
    fromState: null,
    toState: 'Draft',
    actorEmail: 'alice.editor@example.com',
    reason: 'Created initial draft of the streamlined onboarding workflow.',
  },
  {
    processCode: '2',
    versionNumber: 2,
    fromState: 'Draft',
    toState: 'In Review',
    actorEmail: 'alice.editor@example.com',
    reason: 'Submitted the streamlined onboarding workflow for formal review.',
  },
  {
    processCode: '2',
    versionNumber: 2,
    fromState: 'In Review',
    toState: 'Approved',
    actorEmail: 'rachel.reviewer@example.com',
    reason:
      'Approved the streamlined onboarding workflow after validation review.',
  },
  {
    processCode: '2',
    versionNumber: 2,
    fromState: 'Approved',
    toState: 'Published',
    actorEmail: 'peter.publisher@example.com',
    reason:
      'Released the streamlined onboarding workflow for pilot implementation.',
  },
  {
    processCode: '2',
    versionNumber: 2,
    fromState: 'Published',
    toState: 'Archived',
    actorEmail: 'peter.publisher@example.com',
    reason:
      'Archived the streamlined workflow after successful promotion to production.',
  },
  {
    processCode: '2',
    versionNumber: 3,
    fromState: null,
    toState: 'Published',
    actorEmail: 'peter.publisher@example.com',
    reason:
      'Promoted the streamlined onboarding workflow to production as the new standard.',
  },
  {
    processCode: '2',
    versionNumber: 4,
    fromState: null,
    toState: 'Draft',
    actorEmail: 'alice.editor@example.com',
    reason: 'Created initial draft of the AI-assisted onboarding proposal.',
  },
  {
    processCode: '2',
    versionNumber: 4,
    fromState: 'Draft',
    toState: 'In Review',
    actorEmail: 'alice.editor@example.com',
    reason: 'Submitted the AI-assisted onboarding proposal for formal review.',
  },
  {
    processCode: '2',
    versionNumber: 4,
    fromState: 'In Review',
    toState: 'Approved',
    actorEmail: 'rachel.reviewer@example.com',
    reason:
      'Approved the AI-assisted onboarding proposal after validation review.',
  },
  {
    processCode: '2',
    versionNumber: 4,
    fromState: 'Approved',
    toState: 'Draft',
    actorEmail: 'rachel.reviewer@example.com',
    reason:
      'Controlled reopening: Additional data privacy review required before publication due to new ML model integration.',
  },
  {
    processCode: '3',
    versionNumber: 1,
    fromState: null,
    toState: 'Draft',
    actorEmail: 'sam.admin@example.com',
    reason: 'Created initial draft of the quality compliance review workflow.',
  },
  {
    processCode: '3',
    versionNumber: 1,
    fromState: 'Draft',
    toState: 'In Review',
    actorEmail: 'sam.admin@example.com',
    reason:
      'Submitted the quality compliance review workflow for formal review.',
  },
  {
    processCode: '3',
    versionNumber: 1,
    fromState: 'In Review',
    toState: 'Approved',
    actorEmail: 'rachel.reviewer@example.com',
    reason:
      'Approved the quality compliance review workflow after validation review.',
  },
  {
    processCode: '3',
    versionNumber: 1,
    fromState: 'Approved',
    toState: 'Published',
    actorEmail: 'peter.publisher@example.com',
    reason:
      'Released the quality compliance review workflow as the official standard.',
  },
];

export const bpmnAssets: BpmnAssetSeed[] = processVersions.map((version) => ({
  processCode: version.processCode,
  versionNumber: version.versionNumber,
  code: `PROCESS_${version.processCode}_V${version.versionNumber}_BPMN`,
  caption: `${version.title} BPMN Diagram`,
}));

export const auditLogs: AuditLogSeed[] = [
  {
    entityType: 'area',
    entityRef: 'A1',
    action: 'CREATE',
    actorEmail: 'alice.editor@example.com',
    reasonForChange: 'Created area A1 for HR management workflows.',
    newData: {
      code: 'A1',
      title: 'Global Management',
      ownerEmail: 'alice.editor@example.com',
    },
  },
  {
    entityType: 'area',
    entityRef: 'A2',
    action: 'CREATE',
    actorEmail: 'sam.admin@example.com',
    reasonForChange: 'Created area A2 for quality management workflows.',
    newData: {
      code: 'A2',
      title: 'Quality Assurance',
      ownerEmail: 'sam.admin@example.com',
    },
  },
  ...processes.map((process) => ({
    entityType: 'process',
    entityRef: process.code,
    action: 'CREATE' as const,
    actorEmail: 'alice.editor@example.com',
    reasonForChange: `Created process ${process.code} for ${process.title}.`,
    newData: {
      code: process.code,
      title: process.title,
      ownerEmail: process.ownerEmail,
    },
  })),
  ...processVersions.map((version) => {
    let actorEmail: string;
    if (version.processCode === '3') {
      actorEmail = 'sam.admin@example.com';
    } else if (version.versionNumber === 3 && version.processCode === '2') {
      actorEmail = 'peter.publisher@example.com';
    } else {
      actorEmail = 'alice.editor@example.com';
    }
    return {
      entityType: 'process_version',
      entityRef: `${version.processCode}@${version.versionNumber}`,
      action: 'CREATE' as const,
      actorEmail,
      reasonForChange: `Created version ${version.processCode}@${version.versionNumber} for ${version.title}.`,
      newData: {
        processCode: version.processCode,
        versionNumber: version.versionNumber,
        lifecycleState: version.lifecycleState,
        architectureState: version.architectureState,
      },
    };
  }),
  {
    entityType: 'process_version',
    entityRef: '1@1',
    action: 'APPROVE',
    actorEmail: 'rachel.reviewer@example.com',
    reasonForChange:
      'Approved employee relocation workflow after validation review.',
  },
  {
    entityType: 'process_version',
    entityRef: '1@1',
    action: 'PUBLISH',
    actorEmail: 'peter.publisher@example.com',
    reasonForChange:
      'Released employee relocation workflow as official standard.',
  },
  {
    entityType: 'process_version',
    entityRef: '1@2',
    action: 'APPROVE',
    actorEmail: 'rachel.reviewer@example.com',
    reasonForChange:
      'Approved improved relocation workflow after validation review.',
  },
  {
    entityType: 'process_version',
    entityRef: '1@2',
    action: 'PUBLISH',
    actorEmail: 'peter.publisher@example.com',
    reasonForChange:
      'Released improved relocation workflow as proposed target state.',
  },
  {
    entityType: 'process_version',
    entityRef: '1@3',
    action: 'REJECT',
    actorEmail: 'rachel.reviewer@example.com',
    reasonForChange:
      'Rejected the automation proposal due to insufficient cost-benefit analysis and unclear ROI.',
  },
  {
    entityType: 'process_version',
    entityRef: '2@1',
    action: 'APPROVE',
    actorEmail: 'rachel.reviewer@example.com',
    reasonForChange:
      'Approved employee onboarding workflow after validation review.',
  },
  {
    entityType: 'process_version',
    entityRef: '2@1',
    action: 'PUBLISH',
    actorEmail: 'peter.publisher@example.com',
    reasonForChange:
      'Released employee onboarding workflow as official standard.',
  },
  {
    entityType: 'process_version',
    entityRef: '2@1',
    action: 'ARCHIVE',
    actorEmail: 'peter.publisher@example.com',
    reasonForChange:
      'Archived original onboarding workflow after process improvement implementation.',
  },
  {
    entityType: 'process_version',
    entityRef: '2@2',
    action: 'APPROVE',
    actorEmail: 'rachel.reviewer@example.com',
    reasonForChange:
      'Approved streamlined onboarding workflow after validation review.',
  },
  {
    entityType: 'process_version',
    entityRef: '2@2',
    action: 'PUBLISH',
    actorEmail: 'peter.publisher@example.com',
    reasonForChange:
      'Released streamlined onboarding workflow for pilot implementation.',
  },
  {
    entityType: 'process_version',
    entityRef: '2@2',
    action: 'ARCHIVE',
    actorEmail: 'peter.publisher@example.com',
    reasonForChange:
      'Archived streamlined workflow after successful promotion to production.',
  },
  {
    entityType: 'process_version',
    entityRef: '2@3',
    action: 'PROMOTE',
    actorEmail: 'peter.publisher@example.com',
    reasonForChange:
      'Promoted streamlined onboarding workflow to production as new standard.',
    newData: {
      derivedFromVersionNumber: 2,
    },
  },
  {
    entityType: 'process_version',
    entityRef: '2@4',
    action: 'APPROVE',
    actorEmail: 'rachel.reviewer@example.com',
    reasonForChange:
      'Approved the AI-assisted onboarding proposal after validation review.',
  },
  {
    entityType: 'process_version',
    entityRef: '2@4',
    action: 'REOPEN',
    actorEmail: 'rachel.reviewer@example.com',
    reasonForChange:
      'Controlled reopening: Additional data privacy review required before publication due to new ML model integration.',
  },
  {
    entityType: 'process',
    entityRef: '3',
    action: 'CREATE',
    actorEmail: 'sam.admin@example.com',
    reasonForChange: 'Created process 3 for Quality Compliance Review.',
    newData: {
      code: '3',
      title: 'Quality Compliance Review',
      ownerEmail: 'sam.admin@example.com',
    },
  },
  {
    entityType: 'process_version',
    entityRef: '3@1',
    action: 'CREATE',
    actorEmail: 'sam.admin@example.com',
    reasonForChange: 'Created version 3@1 for Quality Compliance Review v1.0.',
    newData: {
      processCode: '3',
      versionNumber: 1,
      lifecycleState: 'Published',
      architectureState: 'AS-IS',
    },
  },
  {
    entityType: 'process_version',
    entityRef: '3@1',
    action: 'APPROVE',
    actorEmail: 'rachel.reviewer@example.com',
    reasonForChange:
      'Approved the quality compliance review workflow after validation review.',
  },
  {
    entityType: 'process_version',
    entityRef: '3@1',
    action: 'PUBLISH',
    actorEmail: 'peter.publisher@example.com',
    reasonForChange:
      'Released the quality compliance review workflow as the official standard.',
  },
  {
    entityType: 'user',
    entityRef: 'victor.viewer@example.com',
    action: 'USER_CREATE',
    actorEmail: 'sam.admin@example.com',
    reasonForChange: 'Created VIEWER user for read-only access testing.',
    newData: {
      email: 'victor.viewer@example.com',
      name: 'Victor Viewer',
      roleName: 'VIEWER',
      teamCode: 'IT',
    },
  },
  {
    entityType: 'user',
    entityRef: 'sam.admin@example.com',
    action: 'USER_CREATE',
    actorEmail: 'sam.admin@example.com',
    reasonForChange: 'Created SYSTEM_ADMIN user for technical administration.',
    newData: {
      email: 'sam.admin@example.com',
      name: 'Sam SystemAdmin',
      roleName: 'SYSTEM_ADMIN',
      teamCode: 'IT',
    },
  },
  {
    entityType: 'user',
    entityRef: 'alice.editor@example.com',
    action: 'ROLE_ASSIGN',
    actorEmail: 'sam.admin@example.com',
    reasonForChange: 'Assigned EDITOR role to Alice Editor.',
    oldData: {
      roleName: null,
    },
    newData: {
      roleName: 'EDITOR',
    },
  },
  {
    entityType: 'user',
    entityRef: 'rachel.reviewer@example.com',
    action: 'ROLE_ASSIGN',
    actorEmail: 'sam.admin@example.com',
    reasonForChange: 'Assigned REVIEWER role to Rachel Reviewer.',
    oldData: {
      roleName: null,
    },
    newData: {
      roleName: 'REVIEWER',
    },
  },
  {
    entityType: 'user',
    entityRef: 'peter.publisher@example.com',
    action: 'ROLE_ASSIGN',
    actorEmail: 'sam.admin@example.com',
    reasonForChange: 'Assigned PUBLISHER role to Peter Publisher.',
    oldData: {
      roleName: null,
    },
    newData: {
      roleName: 'PUBLISHER',
    },
  },
  {
    entityType: 'user',
    entityRef: 'sam.admin@example.com',
    action: 'TEAM_CHANGE',
    actorEmail: 'sam.admin@example.com',
    reasonForChange:
      'Assigned Sam SystemAdmin to IT team for technical operations.',
    oldData: {
      teamCode: null,
    },
    newData: {
      teamCode: 'IT',
    },
  },
  {
    entityType: 'user',
    entityRef: 'alice.editor@example.com',
    action: 'USER_UPDATE',
    actorEmail: 'sam.admin@example.com',
    reasonForChange: 'Updated Alice Editor profile information.',
    oldData: {
      name: 'Alice Editor',
    },
    newData: {
      name: 'Alice Editor',
    },
  },
];
