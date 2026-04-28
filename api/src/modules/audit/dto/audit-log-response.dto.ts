import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import type { AuditAction } from '../types/audit-action.type';

export class AuditLogResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the audit log entry.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Type of the audited entity.',
    example: 'process_version',
  })
  @Expose()
  entityType!: string;

  @ApiProperty({
    description: 'Unique identifier for the audited entity.',
    format: 'uuid',
  })
  @Expose()
  entityId!: string;

  @ApiProperty({
    description: 'Recorded audit action.',
    example: 'PUBLISH',
  })
  @Expose()
  action!: AuditAction;

  @ApiProperty({
    description: 'Identifier of the actor who triggered the event.',
    format: 'uuid',
    nullable: true,
  })
  @Expose()
  actorId!: string | null;

  @ApiProperty({
    description: 'Display name of the actor who triggered the event.',
    nullable: true,
  })
  @Expose()
  actorName!: string | null;

  @ApiProperty({
    description: 'Reason for change recorded with the audit entry.',
  })
  @Expose()
  reasonForChange!: string;

  @ApiProperty({
    description: 'Previous state snapshot when available.',
    type: 'object',
    additionalProperties: true,
    nullable: true,
  })
  @Expose()
  oldData!: Record<string, unknown> | null;

  @ApiProperty({
    description: 'New state snapshot when available.',
    type: 'object',
    additionalProperties: true,
    nullable: true,
  })
  @Expose()
  newData!: Record<string, unknown> | null;

  @ApiProperty({
    description: 'Timestamp when the audit entry was recorded.',
    format: 'date-time',
  })
  @Expose()
  createdAt!: Date;

  constructor(partial: Partial<AuditLogResponseDto>) {
    Object.assign(this, partial);
  }
}
