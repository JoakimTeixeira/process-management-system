import { AuditController } from './audit.controller';
import { AuditReaderService } from './audit-reader.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Role } from '../../common/enums/role.enum';

describe('AuditController', () => {
  let controller: AuditController;
  let auditReaderService: jest.Mocked<
    Pick<
      AuditReaderService,
      'listVersionStateHistory' | 'listLogsByEntity'
    >
  >;

  const mockUser: AuthenticatedUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    roleId: 'role-1',
    role: Role.EDITOR,
    team: {
      id: 'team-1',
      code: 'HR',
      name: 'Human Resources',
    },
  };

  const mockHistoryEntry = {
    id: 'history-1',
    processVersionId: 'version-1',
    fromState: 'Draft',
    toState: 'Approved',
    actorId: 'user-1',
    reason: 'Test reason',
    createdAt: new Date(),
  };

  const mockAuditLog = {
    id: 'log-1',
    entityType: 'process',
    entityId: 'process-1',
    action: 'CREATE',
    actorId: 'user-1',
    reasonForChange: 'Test',
    createdAt: new Date(),
  };

  beforeEach(() => {
    auditReaderService = {
      listVersionStateHistory: jest.fn(),
      listLogsByEntity: jest.fn(),
    } as jest.Mocked<
      Pick<
        AuditReaderService,
        'listVersionStateHistory' | 'listLogsByEntity'
      >
    >;

    controller = new AuditController(
      auditReaderService as unknown as AuditReaderService,
    );
  });

  it('should list version state history', async () => {
    auditReaderService.listVersionStateHistory.mockResolvedValue([
      mockHistoryEntry,
    ]);

    const result = await controller.listVersionStateHistory(
      { processVersionId: 'version-1' },
      mockUser,
    );

    expect(result).toEqual([mockHistoryEntry]);
    expect(auditReaderService.listVersionStateHistory).toHaveBeenCalledWith(
      'version-1',
      mockUser,
    );
  });

  it('should list audit logs by entity', async () => {
    auditReaderService.listLogsByEntity.mockResolvedValue([mockAuditLog]);

    const result = await controller.listAuditLogsByEntity(
      { entityType: 'process', entityId: 'process-1' },
      mockUser,
    );

    expect(result).toEqual([mockAuditLog]);
    expect(auditReaderService.listLogsByEntity).toHaveBeenCalledWith(
      'process',
      'process-1',
      mockUser,
    );
  });
});
