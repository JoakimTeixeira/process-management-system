export const CATALOG_KINDS = [
  'Area',
  'Process',
  'Procedure',
  'Asset',
] as const;

export type CatalogKind = (typeof CATALOG_KINDS)[number];
