import {
  dropIntegrationDatabase,
  migrateIntegrationDatabase,
  resetIntegrationDatabase,
} from './integration-database';

export default async function globalSetup(): Promise<() => Promise<void>> {
  await resetIntegrationDatabase();

  try {
    await migrateIntegrationDatabase();
  } catch (error) {
    await dropIntegrationDatabase();
    throw error;
  }

  return dropIntegrationDatabase;
}
