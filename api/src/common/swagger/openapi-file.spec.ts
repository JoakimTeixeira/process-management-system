import {
  assertOpenApiDocumentCurrent,
  serializeOpenApiDocument,
} from './openapi-file';

describe('OpenAPI file contract', () => {
  const document = {
    openapi: '3.0.0',
    info: { title: 'Example', version: '1.0.0' },
    paths: {},
  };

  it('serializes a stable, newline-terminated document', () => {
    const first = serializeOpenApiDocument(document);
    const second = serializeOpenApiDocument(document);

    expect(first).toBe(second);
    expect(first.endsWith('\n')).toBe(true);
  });

  it('accepts a current contract and rejects drift', () => {
    const expected = serializeOpenApiDocument(document);

    expect(() =>
      assertOpenApiDocumentCurrent(expected, expected),
    ).not.toThrow();
    expect(() => assertOpenApiDocumentCurrent('{}\n', expected)).toThrow(
      'OpenAPI contract is out of date',
    );
  });
});
