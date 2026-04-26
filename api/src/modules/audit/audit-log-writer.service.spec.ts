import { AuditLogWriterService } from './audit-log-writer.service';
import { AuditLogWriterRepository } from './audit-log-writer.repository';
import type { CreateAuditLogEntry } from './interfaces/create-audit-log-entry.interface';
import type { SqlExecutor } from '../../common/types/sql-executor.type';

describe('AuditLogWriterService', () => {
  let service: AuditLogWriterService;
  let repository: AuditLogWriterRepository & {
    create: jest.Mock;
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
    } as AuditLogWriterRepository & {
      create: jest.Mock;
    };

    service = new AuditLogWriterService(repository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create audit log entry', async () => {
    const entry: CreateAuditLogEntry = {
      action: 'CREATE',
      entityType: 'Process',
      entityId: 'process-1',
      actorId: 'user-1',
      reasonForChange: null,
    };

    await service.create(entry);

    expect(repository.create).toHaveBeenCalledWith(entry, undefined);
  });

  it('should create audit log entry with executor', async () => {
    const entry: CreateAuditLogEntry = {
      action: 'CREATE',
      entityType: 'Process',
      entityId: 'process-1',
      actorId: 'user-1',
      reasonForChange: null,
    };
    const executor: SqlExecutor & { query: jest.Mock } = {
      query: jest.fn(),
    };

    await service.create(entry, executor);

    expect(repository.create).toHaveBeenCalledWith(entry, executor);
  });

  it('should throw error when repository.create fails', async () => {
    const entry: CreateAuditLogEntry = {
      action: 'CREATE',
      entityType: 'Process',
      entityId: 'process-1',
      actorId: 'user-1',
      reasonForChange: null,
    };
    repository.create.mockRejectedValue(new Error('Database error'));

    await expect(service.create(entry)).rejects.toThrow('Database error');
  });
});
