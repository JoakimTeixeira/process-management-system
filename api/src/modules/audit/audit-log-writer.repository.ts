import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import type { SqlExecutor } from '../../common/types/sql-executor.type';
import type { CreateAuditLogEntry } from './interfaces/create-audit-log-entry.interface';

@Injectable()
export class AuditLogWriterRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(
    entry: CreateAuditLogEntry,
    executor: SqlExecutor = this.dataSource,
  ): Promise<void> {
    await executor.query(
      `
        INSERT INTO audit_logs (
          entity_type,
          entity_id,
          action,
          actor_id,
          reason_for_change,
          old_data,
          new_data
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
      `,
      [
        entry.entityType,
        entry.entityId,
        entry.action,
        entry.actorId,
        entry.reasonForChange,
        entry.oldData ? JSON.stringify(entry.oldData) : null,
        entry.newData ? JSON.stringify(entry.newData) : null,
      ],
    );
  }
}
