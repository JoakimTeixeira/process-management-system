import type { components } from './generated/api.types';
import type {
  AppRole,
  ArchitectureState,
  CreateGlossaryTermResponse,
  LifecycleState,
} from '../models/backoffice.models';

describe('backoffice generated API contract', () => {
  it('should accept canonical roles and process-version states from generated schemas', () => {
    const roles: AppRole[] = ['EDITOR', 'REVIEWER', 'PUBLISHER', 'VIEWER', 'SYSTEM_ADMIN'];
    const lifecycleStates: LifecycleState[] = [
      'Draft',
      'In Review',
      'Approved',
      'Published',
      'Archived',
    ];
    const architectureStates: ArchitectureState[] = ['AS-IS', 'TO-BE'];
    const version: components['schemas']['ProcessVersionResponseDto'] = {
      id: 'version-id',
      processId: 'process-id',
      versionNumber: 1,
      lifecycleState: lifecycleStates[0],
      architectureState: architectureStates[0],
      title: 'Current process',
      checklistCompleted: false,
      derivedFromVersionId: null,
      changeDescription: 'Initial version',
      reasonForChange: 'Establish current state',
    };

    expect(roles).toEqual(['EDITOR', 'REVIEWER', 'PUBLISHER', 'VIEWER', 'SYSTEM_ADMIN']);
    expect(version.lifecycleState).toBe('Draft');
    expect(version.architectureState).toBe('AS-IS');
  });

  it('should type glossary mutation responses from operation response schemas', () => {
    const createdTerm: CreateGlossaryTermResponse = {
      id: 'term-id',
      term: 'Incident management',
      definition: 'Restore normal service as quickly as possible.',
      category: 'ITIL',
      isPreferred: true,
      createdBy: null,
    };

    expect(createdTerm.term).toBe('Incident management');
  });
});
