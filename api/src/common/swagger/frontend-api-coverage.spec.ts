import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { FRONTEND_API_OPERATIONS } from './frontend-api-operations';

type ResponseObject = {
  content?: Record<string, { schema?: unknown }>;
};

type OperationContract = {
  responses?: Record<string, ResponseObject | { $ref: string }>;
};

type OpenApiContract = {
  paths: Record<
    string,
    Partial<Record<'get' | 'post' | 'patch' | 'delete', OperationContract>>
  >;
};

describe('frontend-consumed OpenAPI coverage', () => {
  const document = JSON.parse(
    readFileSync(resolve(__dirname, '../../../openapi/openapi.json'), 'utf8'),
  ) as OpenApiContract;

  it.each(FRONTEND_API_OPERATIONS)(
    'should $method $path documents its $responseKind success response',
    ({ method, path, responseKind }) => {
      const operation = document.paths[path]?.[method];
      expect(operation).toBeDefined();

      const successResponse = Object.entries(operation?.responses ?? {}).find(
        ([status]) => /^2\d\d$/.test(status),
      )?.[1];
      expect(successResponse).toBeDefined();

      if (!successResponse || '$ref' in successResponse) {
        throw new Error(
          `Expected an inline success response for ${method} ${path}`,
        );
      }

      const schemas = Object.values(successResponse.content ?? {})
        .map((mediaType) => mediaType.schema)
        .filter(
          (schema): schema is Record<string, unknown> =>
            typeof schema === 'object' && schema !== null,
        );

      if (responseKind === 'none') {
        expect(schemas).toHaveLength(0);
      } else if (responseKind === 'text') {
        expect(schemas).toContainEqual(
          expect.objectContaining({ type: 'string' }),
        );
      } else {
        expect(schemas.length).toBeGreaterThan(0);
      }
    },
  );
});
