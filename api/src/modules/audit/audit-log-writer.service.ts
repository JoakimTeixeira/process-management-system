import { Injectable } from '@nestjs/common';

import type { SqlExecutor } from '../../common/types/sql-executor.type';
import type { CreateAuditLogEntry } from './interfaces/create-audit-log-entry.interface';
import { AuditLogWriterRepository } from './audit-log-writer.repository';

@Injectable()
export class AuditLogWriterService {
  constructor(
    private readonly auditLogWriterRepository: AuditLogWriterRepository,
  ) {}

  async create(
    entry: CreateAuditLogEntry,
    executor?: SqlExecutor,
  ): Promise<void> {
    await this.auditLogWriterRepository.create(entry, executor);
  }
}
