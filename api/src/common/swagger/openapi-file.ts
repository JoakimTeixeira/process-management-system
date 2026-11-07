export function serializeOpenApiDocument(document: unknown): string {
  return `${JSON.stringify(document, null, 2)}\n`;
}

export function assertOpenApiDocumentCurrent(
  currentDocument: string,
  generatedDocument: string,
): void {
  if (currentDocument !== generatedDocument) {
    throw new Error(
      'OpenAPI contract is out of date. Run npm run openapi:generate --prefix api.',
    );
  }
}
