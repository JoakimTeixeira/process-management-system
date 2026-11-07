import { dropIntegrationDatabase } from './integration-database';

export default async function globalTeardown(): Promise<void> {
  await dropIntegrationDatabase();
}
