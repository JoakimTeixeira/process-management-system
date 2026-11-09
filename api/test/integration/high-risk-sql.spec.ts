import type { DataSource } from 'typeorm';

import {
  cleanupHighRiskSqlFixtures,
  createHighRiskSqlContext,
  prepareHighRiskSqlFixtures,
  seedLifecycleScenario,
  seedPromotionScenario,
  seedVisibilityScenario,
} from './high-risk-sql-fixtures';
import { createIntegrationDataSource } from './integration-database';

interface LifecycleRow {
  id: string;
  lifecycle_state: string;
  checklist_completed: boolean;
}

interface HistoryRow {
  process_version_id: string;
  from_state: string | null;
  to_state: string;
  actor_id: string | null;
}

interface AuditRow {
  entity_id: string;
  action: string;
  actor_id: string | null;
}

interface ProcedureCloneRow {
  process_version_id: string;
  code: string;
  title: string;
  activities: Record<string, unknown>[];
  inputs: string[];
  outputs: string[];
  created_by: string | null;
  updated_by: string | null;
}

interface AssetCloneRow {
  process_version_id: string;
  caption: string;
  asset_type: string;
  file_path: string;
  mime_type: string;
  checksum: string;
  size_bytes: string;
  created_by: string | null;
}

describe('high-risk PostgreSQL paths', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = createIntegrationDataSource();
    await dataSource.initialize();
    await prepareHighRiskSqlFixtures(dataSource);
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await cleanupHighRiskSqlFixtures(dataSource);
      await dataSource.destroy();
    }
  });

  it('should enforce same-team RBAC through real ownership joins', async () => {
    const scenario = await seedLifecycleScenario(dataSource, 'rbac');
    const { workflowAuthorizationService } =
      createHighRiskSqlContext(dataSource);

    await expect(
      workflowAuthorizationService.assertSameTeamAsProcessVersionOwner(
        scenario.draftVersionId,
        scenario.outsideEditor,
      ),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      workflowAuthorizationService.assertSameTeamAsProcedureOwner(
        scenario.procedureId,
        scenario.outsideEditor,
      ),
    ).rejects.toMatchObject({ status: 403 });

    await expect(
      workflowAuthorizationService.assertSameTeamAsProcessVersionOwner(
        scenario.draftVersionId,
        scenario.editor,
      ),
    ).resolves.toBeUndefined();
    await expect(
      workflowAuthorizationService.assertSameTeamAsProcedureOwner(
        scenario.procedureId,
        scenario.editor,
      ),
    ).resolves.toBeUndefined();
  });

  it('should persist lifecycle transitions, archival, history, and audit atomically', async () => {
    const scenario = await seedLifecycleScenario(dataSource, 'lifecycle');
    const { processVersionsService } = createHighRiskSqlContext(dataSource);

    await processVersionsService.submitForReview(
      scenario.draftVersionId,
      { reason: 'Ready for integration review' },
      scenario.editor,
    );
    await processVersionsService.approve(
      scenario.draftVersionId,
      { reason: 'SQL-backed approval' },
      scenario.reviewer,
    );
    const published = await processVersionsService.publish(
      scenario.draftVersionId,
      { reason: 'SQL-backed publication' },
      scenario.publisher,
    );

    const versions = await dataSource.query<LifecycleRow[]>(
      `
        SELECT id, lifecycle_state, checklist_completed
        FROM process_versions
        WHERE id = ANY($1::uuid[])
        ORDER BY version_number ASC
      `,
      [[scenario.previousPublishedVersionId, scenario.draftVersionId]],
    );
    const history = await dataSource.query<HistoryRow[]>(
      `
        SELECT process_version_id, from_state, to_state, actor_id
        FROM version_state_history
        WHERE process_version_id = ANY($1::uuid[])
        ORDER BY created_at ASC, id ASC
      `,
      [[scenario.previousPublishedVersionId, scenario.draftVersionId]],
    );
    const audit = await dataSource.query<AuditRow[]>(
      `
        SELECT entity_id, action, actor_id
        FROM audit_logs
        WHERE entity_id = ANY($1::uuid[])
        ORDER BY created_at ASC, id ASC
      `,
      [[scenario.previousPublishedVersionId, scenario.draftVersionId]],
    );

    expect(published).toMatchObject({
      id: scenario.draftVersionId,
      lifecycleState: 'Published',
      checklistCompleted: true,
    });
    expect(versions).toEqual([
      {
        id: scenario.previousPublishedVersionId,
        lifecycle_state: 'Archived',
        checklist_completed: true,
      },
      {
        id: scenario.draftVersionId,
        lifecycle_state: 'Published',
        checklist_completed: true,
      },
    ]);
    expect(history).toEqual(
      expect.arrayContaining([
        {
          process_version_id: scenario.draftVersionId,
          from_state: 'Draft',
          to_state: 'In Review',
          actor_id: scenario.editor.id,
        },
        {
          process_version_id: scenario.draftVersionId,
          from_state: 'In Review',
          to_state: 'Approved',
          actor_id: scenario.reviewer.id,
        },
        {
          process_version_id: scenario.previousPublishedVersionId,
          from_state: 'Published',
          to_state: 'Archived',
          actor_id: scenario.publisher.id,
        },
        {
          process_version_id: scenario.draftVersionId,
          from_state: 'Approved',
          to_state: 'Published',
          actor_id: scenario.publisher.id,
        },
      ]),
    );
    expect(audit).toEqual(
      expect.arrayContaining([
        {
          entity_id: scenario.draftVersionId,
          action: 'STATE_CHANGE',
          actor_id: scenario.editor.id,
        },
        {
          entity_id: scenario.draftVersionId,
          action: 'APPROVE',
          actor_id: scenario.reviewer.id,
        },
        {
          entity_id: scenario.previousPublishedVersionId,
          action: 'ARCHIVE',
          actor_id: scenario.publisher.id,
        },
        {
          entity_id: scenario.draftVersionId,
          action: 'PUBLISH',
          actor_id: scenario.publisher.id,
        },
      ]),
    );
  });

  it('should expose only published process, version, procedure, and BPMN SQL rows', async () => {
    const scenario = await seedVisibilityScenario(dataSource, 'visibility');
    const { publicProcessesRepository, publicProceduresRepository } =
      createHighRiskSqlContext(dataSource);

    const processes = await publicProcessesRepository.listProcesses({});
    const publishedAsIs =
      await publicProcessesRepository.findPublishedProcessVersion(
        scenario.processId,
        'AS-IS',
      );
    const unpublishedToBe =
      await publicProcessesRepository.findPublishedProcessVersion(
        scenario.processId,
        'TO-BE',
      );
    const procedures = await publicProceduresRepository.listProcedures({});
    const hiddenProcedure =
      await publicProceduresRepository.findProcedureDetail(
        scenario.draftProcedureId,
      );
    const publishedBpmn =
      await publicProcessesRepository.findPublishedBpmnAsset(
        scenario.publishedVersionId,
      );
    const draftBpmn = await publicProcessesRepository.findPublishedBpmnAsset(
      scenario.draftVersionId,
    );

    expect(processes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: scenario.processId,
          available_architectures: ['AS-IS'],
        }),
      ]),
    );
    expect(publishedAsIs).toMatchObject({ id: scenario.publishedVersionId });
    expect(unpublishedToBe).toBeNull();
    expect(procedures.map((procedure) => procedure.id)).toContain(
      scenario.publishedProcedureId,
    );
    expect(procedures.map((procedure) => procedure.id)).not.toContain(
      scenario.draftProcedureId,
    );
    expect(hiddenProcedure).toBeNull();
    expect(publishedBpmn).toEqual({ file_path: scenario.publishedBpmnPath });
    expect(draftBpmn).toBeNull();
  });

  it('should promote TO-BE by cloning procedure and asset content through real SQL', async () => {
    const scenario = await seedPromotionScenario(dataSource, 'promotion');
    const { processVersionsService } = createHighRiskSqlContext(dataSource);

    const promoted = await processVersionsService.promote(
      scenario.toBeVersionId,
      {
        title: 'Promoted current-state baseline',
        justification: 'Validated by PostgreSQL integration coverage',
      },
      scenario.publisher,
    );

    const sourceStates = await dataSource.query<LifecycleRow[]>(
      `
        SELECT id, lifecycle_state, checklist_completed
        FROM process_versions
        WHERE id = ANY($1::uuid[])
        ORDER BY version_number ASC
      `,
      [[scenario.previousAsIsVersionId, scenario.toBeVersionId]],
    );
    const clonedProcedures = await dataSource.query<ProcedureCloneRow[]>(
      `
        SELECT
          process_version_id,
          code,
          title,
          activities,
          inputs,
          outputs,
          created_by,
          updated_by
        FROM procedures
        WHERE process_version_id = $1
        ORDER BY code ASC
      `,
      [promoted.id],
    );
    const clonedAssets = await dataSource.query<AssetCloneRow[]>(
      `
        SELECT
          process_version_id,
          caption,
          asset_type,
          file_path,
          mime_type,
          checksum,
          size_bytes::text,
          created_by
        FROM assets
        WHERE process_version_id = $1
        ORDER BY file_path ASC
      `,
      [promoted.id],
    );

    expect(promoted).toMatchObject({
      processId: scenario.processId,
      versionNumber: 3,
      lifecycleState: 'Published',
      architectureState: 'AS-IS',
      title: 'Promoted current-state baseline',
      derivedFromVersionId: scenario.toBeVersionId,
    });
    expect(sourceStates).toEqual([
      {
        id: scenario.previousAsIsVersionId,
        lifecycle_state: 'Archived',
        checklist_completed: true,
      },
      {
        id: scenario.toBeVersionId,
        lifecycle_state: 'Archived',
        checklist_completed: true,
      },
    ]);
    expect(clonedProcedures).toEqual([
      {
        process_version_id: promoted.id,
        code: 'PROC-001',
        title: 'Validate request',
        activities: [{ order: 1, title: 'Inspect payload' }],
        inputs: ['Request'],
        outputs: ['Decision'],
        created_by: scenario.publisher.id,
        updated_by: scenario.publisher.id,
      },
    ]);
    expect(clonedAssets).toEqual([
      {
        process_version_id: promoted.id,
        caption: 'Decision support',
        asset_type: 'PDF',
        file_path: '/integration/decision-support.pdf',
        mime_type: 'application/pdf',
        checksum: 'pdf-checksum',
        size_bytes: '256',
        created_by: scenario.publisher.id,
      },
      {
        process_version_id: promoted.id,
        caption: 'Target workflow',
        asset_type: 'BPMN',
        file_path: '/integration/target-workflow.bpmn',
        mime_type: 'application/xml',
        checksum: 'bpmn-checksum',
        size_bytes: '512',
        created_by: scenario.publisher.id,
      },
    ]);
  });
});
