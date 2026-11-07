import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type SchemaObject = {
  type?: string;
  nullable?: boolean;
  additionalProperties?: boolean | SchemaObject;
  items?: SchemaObject;
  properties?: Record<string, SchemaObject>;
};

type OpenApiContract = {
  components: {
    schemas: Record<string, SchemaObject>;
  };
};

describe('frontend-consumed OpenAPI schema quality', () => {
  const document = JSON.parse(
    readFileSync(resolve(__dirname, '../../../openapi/openapi.json'), 'utf8'),
  ) as OpenApiContract;

  const nullableStringFields = [
    ['VersionStateHistoryResponseDto', 'actorId'],
    ['VersionStateHistoryResponseDto', 'actorName'],
    ['VersionStateHistoryResponseDto', 'reason'],
    ['AuditLogResponseDto', 'actorId'],
    ['AuditLogResponseDto', 'actorName'],
    ['ProcessVersionResponseDto', 'derivedFromVersionId'],
    ['AssetResponseDto', 'supersededAt'],
    ['AssetResponseDto', 'supersededByAssetId'],
    ['GovernanceActiveWorkflowVersionDto', 'waitingForRole'],
    ['GovernanceActiveWorkflowVersionDto', 'nextAction'],
    ['ProcessResponseDto', 'description'],
    ['ItilPracticeResponseDto', 'description'],
    ['AreaResponseDto', 'description'],
    ['GlossaryTermResponseDto', 'category'],
    ['GlossaryTermResponseDto', 'createdBy'],
    ['CreateGlossaryTermDto', 'category'],
    ['UpdateGlossaryTermDto', 'category'],
    ['PublicProcessSummaryResponseDto', 'description'],
    ['PublicProcedureSummaryResponseDto', 'description'],
    ['PublicProcessDetailProcessResponseDto', 'description'],
    ['PublicProcessHistoryItemResponseDto', 'derivedFromVersionId'],
  ] as const;

  it.each(nullableStringFields)(
    '%s.%s remains a nullable string contract',
    (schemaName, propertyName) => {
      expect(
        document.components.schemas[schemaName]?.properties?.[propertyName],
      ).toEqual(expect.objectContaining({ type: 'string', nullable: true }));
    },
  );

  it('documents public procedure activities as extensible objects', () => {
    const activities =
      document.components.schemas.PublicProcedureSummaryResponseDto?.properties
        ?.activities;

    expect(activities).toEqual(
      expect.objectContaining({
        type: 'array',
      }),
    );
    expect(activities?.items).toEqual(
      expect.objectContaining({
        type: 'object',
        additionalProperties: true,
      }),
    );
  });
});
