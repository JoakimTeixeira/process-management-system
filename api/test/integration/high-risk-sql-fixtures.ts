import type { DataSource } from 'typeorm';

import { Role } from '../../src/common/enums/role.enum';
import { AuditLogWriterRepository } from '../../src/modules/audit/audit-log-writer.repository';
import { AuditLogWriterService } from '../../src/modules/audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../../src/modules/auth/interfaces/authenticated-user.interface';
import { ProcessesRepository } from '../../src/modules/processes/processes.repository';
import { ProcessVersionsRepository } from '../../src/modules/process_versions/process-versions.repository';
import { ProcessVersionsService } from '../../src/modules/process_versions/process-versions.service';
import { PublicProcessesRepository } from '../../src/modules/public_portal/public-processes.repository';
import { PublicProceduresRepository } from '../../src/modules/public_portal/public-procedures.repository';
import { WorkflowAuthorizationRepository } from '../../src/modules/workflow_support/workflow-authorization.repository';
import { WorkflowAuthorizationService } from '../../src/modules/workflow_support/workflow-authorization.service';

interface IdRow {
  id: string;
}

interface SeededHierarchy {
  processId: string;
  owner: AuthenticatedUser;
  editor: AuthenticatedUser;
  reviewer: AuthenticatedUser;
  publisher: AuthenticatedUser;
  outsideEditor: AuthenticatedUser;
}

export interface LifecycleScenario extends SeededHierarchy {
  previousPublishedVersionId: string;
  draftVersionId: string;
  procedureId: string;
}

export interface VisibilityScenario {
  processId: string;
  publishedVersionId: string;
  draftVersionId: string;
  publishedProcedureId: string;
  draftProcedureId: string;
  publishedBpmnPath: string;
}

export interface PromotionScenario {
  processId: string;
  previousAsIsVersionId: string;
  toBeVersionId: string;
  publisher: AuthenticatedUser;
}

const BUSINESS_TABLES = `
  audit_logs,
  version_state_history,
  assets,
  procedures,
  process_versions,
  processes,
  areas,
  itil_practices,
  users,
  teams,
  roles
`;

async function insertId(
  dataSource: DataSource,
  sql: string,
  parameters: readonly unknown[],
): Promise<string> {
  const rows = await dataSource.query<IdRow[]>(sql, [...parameters]);
  const id = rows[0]?.id;

  if (!id) {
    throw new TypeError('Expected integration fixture insert to return an id');
  }

  return id;
}

async function findRoleId(dataSource: DataSource, role: Role): Promise<string> {
  const rows = await dataSource.query<IdRow[]>(
    'SELECT id FROM roles WHERE name = $1',
    [role],
  );
  const id = rows[0]?.id;

  if (!id) {
    throw new TypeError(`Expected integration role "${role}" to exist`);
  }

  return id;
}

async function insertUser(
  dataSource: DataSource,
  params: {
    prefix: string;
    label: string;
    role: Role;
    teamId: string;
    teamCode: string;
    teamName: string;
  },
): Promise<AuthenticatedUser> {
  const roleId = await findRoleId(dataSource, params.role);
  const name = `${params.prefix} ${params.label}`;
  const email = `${params.prefix}.${params.label}@integration.test`;
  const id = await insertId(
    dataSource,
    `
      INSERT INTO users (role_id, team_id, name, email, password_hash)
      VALUES ($1, $2, $3, $4, 'integration-password-hash')
      RETURNING id
    `,
    [roleId, params.teamId, name, email],
  );

  return {
    id,
    name,
    email,
    roleId,
    role: params.role,
    team: {
      id: params.teamId,
      code: params.teamCode,
      name: params.teamName,
    },
  };
}

async function seedHierarchy(
  dataSource: DataSource,
  prefix: string,
): Promise<SeededHierarchy> {
  const teamCode = `${prefix}-TEAM`;
  const teamName = `${prefix} workflow team`;
  const outsideTeamCode = `${prefix}-OUTSIDE`;
  const outsideTeamName = `${prefix} outside team`;
  const teamId = await insertId(
    dataSource,
    `
      INSERT INTO teams (code, name, description)
      VALUES ($1, $2, 'Integration workflow team')
      RETURNING id
    `,
    [teamCode, teamName],
  );
  const outsideTeamId = await insertId(
    dataSource,
    `
      INSERT INTO teams (code, name, description)
      VALUES ($1, $2, 'Integration outside team')
      RETURNING id
    `,
    [outsideTeamCode, outsideTeamName],
  );
  const owner = await insertUser(dataSource, {
    prefix,
    label: 'owner',
    role: Role.EDITOR,
    teamId,
    teamCode,
    teamName,
  });
  const editor = await insertUser(dataSource, {
    prefix,
    label: 'editor',
    role: Role.EDITOR,
    teamId,
    teamCode,
    teamName,
  });
  const reviewer = await insertUser(dataSource, {
    prefix,
    label: 'reviewer',
    role: Role.REVIEWER,
    teamId,
    teamCode,
    teamName,
  });
  const publisher = await insertUser(dataSource, {
    prefix,
    label: 'publisher',
    role: Role.PUBLISHER,
    teamId,
    teamCode,
    teamName,
  });
  const outsideEditor = await insertUser(dataSource, {
    prefix,
    label: 'outside-editor',
    role: Role.EDITOR,
    teamId: outsideTeamId,
    teamCode: outsideTeamCode,
    teamName: outsideTeamName,
  });
  const practiceId = await insertId(
    dataSource,
    `
      INSERT INTO itil_practices (code, name, description)
      VALUES ($1, $2, 'Integration practice')
      RETURNING id
    `,
    [`${prefix}-PRACTICE`, `${prefix} practice`],
  );
  const areaId = await insertId(
    dataSource,
    `
      INSERT INTO areas (
        itil_practice_id,
        code,
        title,
        description,
        team_id,
        owner_id,
        created_by,
        updated_by
      )
      VALUES ($1, $2, $3, 'Integration area', $4, $5, $5, $5)
      RETURNING id
    `,
    [practiceId, `${prefix}-AREA`, `${prefix} area`, teamId, owner.id],
  );
  const processId = await insertId(
    dataSource,
    `
      INSERT INTO processes (
        area_id,
        code,
        title,
        description,
        team_id,
        owner_id,
        created_by,
        updated_by
      )
      VALUES ($1, $2, $3, 'Integration process', $4, $5, $5, $5)
      RETURNING id
    `,
    [areaId, `${prefix}-PROCESS`, `${prefix} process`, teamId, owner.id],
  );

  return {
    processId,
    owner,
    editor,
    reviewer,
    publisher,
    outsideEditor,
  };
}

async function insertVersion(
  dataSource: DataSource,
  params: {
    processId: string;
    versionNumber: number;
    lifecycleState: string;
    architectureState: string;
    title: string;
    checklistCompleted: boolean;
    actorId: string;
  },
): Promise<string> {
  return await insertId(
    dataSource,
    `
      INSERT INTO process_versions (
        process_id,
        version_number,
        lifecycle_state,
        architecture_state,
        title,
        checklist_completed,
        change_description,
        reason_for_change,
        created_by,
        updated_by
      )
      VALUES (
        $1,
        $2,
        $3::process_lifecycle_state,
        $4::process_architecture_state,
        $5,
        $6,
        'Integration change description',
        'Integration reason for change',
        $7,
        $7
      )
      RETURNING id
    `,
    [
      params.processId,
      params.versionNumber,
      params.lifecycleState,
      params.architectureState,
      params.title,
      params.checklistCompleted,
      params.actorId,
    ],
  );
}

async function insertProcedure(
  dataSource: DataSource,
  params: {
    processVersionId: string;
    actorId: string;
    code?: string;
    title?: string;
    activities?: Record<string, unknown>[];
    inputs?: string[];
    outputs?: string[];
  },
): Promise<string> {
  return await insertId(
    dataSource,
    `
      INSERT INTO procedures (
        process_version_id,
        code,
        title,
        utility,
        warranty,
        outcome,
        policy,
        activities,
        inputs,
        outputs,
        created_by,
        updated_by
      )
      VALUES (
        $1,
        $2,
        $3,
        'Integration utility',
        'Integration warranty',
        'Integration outcome',
        'Integration policy',
        $4::jsonb,
        $5::jsonb,
        $6::jsonb,
        $7,
        $7
      )
      RETURNING id
    `,
    [
      params.processVersionId,
      params.code ?? 'PROC-001',
      params.title ?? 'Integration procedure',
      JSON.stringify(params.activities ?? []),
      JSON.stringify(params.inputs ?? []),
      JSON.stringify(params.outputs ?? []),
      params.actorId,
    ],
  );
}

async function insertAsset(
  dataSource: DataSource,
  params: {
    processVersionId: string;
    actorId: string;
    caption: string;
    assetType: 'BPMN' | 'PDF';
    filePath: string;
    mimeType: string;
    checksum: string;
    sizeBytes: number;
  },
): Promise<string> {
  return await insertId(
    dataSource,
    `
      INSERT INTO assets (
        process_version_id,
        caption,
        asset_type,
        file_path,
        mime_type,
        checksum,
        size_bytes,
        created_by
      )
      VALUES ($1, $2, $3::asset_type, $4, $5, $6, $7, $8)
      RETURNING id
    `,
    [
      params.processVersionId,
      params.caption,
      params.assetType,
      params.filePath,
      params.mimeType,
      params.checksum,
      params.sizeBytes,
      params.actorId,
    ],
  );
}

export async function prepareHighRiskSqlFixtures(
  dataSource: DataSource,
): Promise<void> {
  await cleanupHighRiskSqlFixtures(dataSource);
  await dataSource.query(
    `
      INSERT INTO roles (name, description)
      VALUES
        ('EDITOR', 'Integration editor'),
        ('REVIEWER', 'Integration reviewer'),
        ('PUBLISHER', 'Integration publisher'),
        ('VIEWER', 'Integration viewer'),
        ('SYSTEM_ADMIN', 'Integration system administrator')
    `,
  );
}

export async function cleanupHighRiskSqlFixtures(
  dataSource: DataSource,
): Promise<void> {
  await dataSource.query(`TRUNCATE TABLE ${BUSINESS_TABLES} CASCADE`);
}

export function createHighRiskSqlContext(dataSource: DataSource): {
  processVersionsService: ProcessVersionsService;
  workflowAuthorizationService: WorkflowAuthorizationService;
  publicProcessesRepository: PublicProcessesRepository;
  publicProceduresRepository: PublicProceduresRepository;
} {
  const processVersionsRepository = new ProcessVersionsRepository(dataSource);
  const workflowAuthorizationService = new WorkflowAuthorizationService(
    new WorkflowAuthorizationRepository(dataSource),
  );
  const auditLogWriterService = new AuditLogWriterService(
    new AuditLogWriterRepository(dataSource),
  );

  return {
    processVersionsService: new ProcessVersionsService(
      dataSource,
      new ProcessesRepository(dataSource),
      processVersionsRepository,
      workflowAuthorizationService,
      auditLogWriterService,
    ),
    workflowAuthorizationService,
    publicProcessesRepository: new PublicProcessesRepository(dataSource),
    publicProceduresRepository: new PublicProceduresRepository(dataSource),
  };
}

export async function seedLifecycleScenario(
  dataSource: DataSource,
  prefix: string,
): Promise<LifecycleScenario> {
  const hierarchy = await seedHierarchy(dataSource, prefix);
  const previousPublishedVersionId = await insertVersion(dataSource, {
    processId: hierarchy.processId,
    versionNumber: 1,
    lifecycleState: 'Published',
    architectureState: 'AS-IS',
    title: 'Previous published baseline',
    checklistCompleted: true,
    actorId: hierarchy.publisher.id,
  });
  const draftVersionId = await insertVersion(dataSource, {
    processId: hierarchy.processId,
    versionNumber: 2,
    lifecycleState: 'Draft',
    architectureState: 'AS-IS',
    title: 'Candidate baseline',
    checklistCompleted: false,
    actorId: hierarchy.editor.id,
  });
  const procedureId = await insertProcedure(dataSource, {
    processVersionId: draftVersionId,
    actorId: hierarchy.editor.id,
  });
  await insertAsset(dataSource, {
    processVersionId: draftVersionId,
    actorId: hierarchy.editor.id,
    caption: 'Candidate workflow',
    assetType: 'BPMN',
    filePath: `/integration/${prefix}-candidate.bpmn`,
    mimeType: 'application/xml',
    checksum: `${prefix}-bpmn-checksum`,
    sizeBytes: 128,
  });

  return {
    ...hierarchy,
    previousPublishedVersionId,
    draftVersionId,
    procedureId,
  };
}

export async function seedVisibilityScenario(
  dataSource: DataSource,
  prefix: string,
): Promise<VisibilityScenario> {
  const hierarchy = await seedHierarchy(dataSource, prefix);
  const publishedVersionId = await insertVersion(dataSource, {
    processId: hierarchy.processId,
    versionNumber: 1,
    lifecycleState: 'Published',
    architectureState: 'AS-IS',
    title: 'Public baseline',
    checklistCompleted: true,
    actorId: hierarchy.publisher.id,
  });
  const draftVersionId = await insertVersion(dataSource, {
    processId: hierarchy.processId,
    versionNumber: 2,
    lifecycleState: 'Draft',
    architectureState: 'TO-BE',
    title: 'Private target',
    checklistCompleted: false,
    actorId: hierarchy.editor.id,
  });
  const publishedProcedureId = await insertProcedure(dataSource, {
    processVersionId: publishedVersionId,
    actorId: hierarchy.publisher.id,
    title: 'Published procedure',
  });
  const draftProcedureId = await insertProcedure(dataSource, {
    processVersionId: draftVersionId,
    actorId: hierarchy.editor.id,
    title: 'Draft procedure',
  });
  const publishedBpmnPath = `/integration/${prefix}-published.bpmn`;
  await insertAsset(dataSource, {
    processVersionId: publishedVersionId,
    actorId: hierarchy.publisher.id,
    caption: 'Published workflow',
    assetType: 'BPMN',
    filePath: publishedBpmnPath,
    mimeType: 'application/xml',
    checksum: `${prefix}-published-checksum`,
    sizeBytes: 256,
  });
  await insertAsset(dataSource, {
    processVersionId: draftVersionId,
    actorId: hierarchy.editor.id,
    caption: 'Draft workflow',
    assetType: 'BPMN',
    filePath: `/integration/${prefix}-draft.bpmn`,
    mimeType: 'application/xml',
    checksum: `${prefix}-draft-checksum`,
    sizeBytes: 256,
  });

  return {
    processId: hierarchy.processId,
    publishedVersionId,
    draftVersionId,
    publishedProcedureId,
    draftProcedureId,
    publishedBpmnPath,
  };
}

export async function seedPromotionScenario(
  dataSource: DataSource,
  prefix: string,
): Promise<PromotionScenario> {
  const hierarchy = await seedHierarchy(dataSource, prefix);
  const previousAsIsVersionId = await insertVersion(dataSource, {
    processId: hierarchy.processId,
    versionNumber: 1,
    lifecycleState: 'Published',
    architectureState: 'AS-IS',
    title: 'Current baseline',
    checklistCompleted: true,
    actorId: hierarchy.publisher.id,
  });
  const toBeVersionId = await insertVersion(dataSource, {
    processId: hierarchy.processId,
    versionNumber: 2,
    lifecycleState: 'Published',
    architectureState: 'TO-BE',
    title: 'Target baseline',
    checklistCompleted: true,
    actorId: hierarchy.publisher.id,
  });
  await insertProcedure(dataSource, {
    processVersionId: toBeVersionId,
    actorId: hierarchy.publisher.id,
    code: 'PROC-001',
    title: 'Validate request',
    activities: [{ order: 1, title: 'Inspect payload' }],
    inputs: ['Request'],
    outputs: ['Decision'],
  });
  await insertAsset(dataSource, {
    processVersionId: toBeVersionId,
    actorId: hierarchy.publisher.id,
    caption: 'Target workflow',
    assetType: 'BPMN',
    filePath: '/integration/target-workflow.bpmn',
    mimeType: 'application/xml',
    checksum: 'bpmn-checksum',
    sizeBytes: 512,
  });
  await insertAsset(dataSource, {
    processVersionId: toBeVersionId,
    actorId: hierarchy.publisher.id,
    caption: 'Decision support',
    assetType: 'PDF',
    filePath: '/integration/decision-support.pdf',
    mimeType: 'application/pdf',
    checksum: 'pdf-checksum',
    sizeBytes: 256,
  });

  return {
    processId: hierarchy.processId,
    previousAsIsVersionId,
    toBeVersionId,
    publisher: hierarchy.publisher,
  };
}
