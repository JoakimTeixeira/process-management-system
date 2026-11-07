import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import {
  LIFECYCLE_STATES,
  type LifecycleState,
} from '../../../common/enums/lifecycle-state.enum';

export class VersionStateHistoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the state-history entry.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Parent process version UUID.',
    format: 'uuid',
  })
  @Expose()
  processVersionId!: string;

  @ApiProperty({
    description: 'Previous lifecycle state.',
    enum: LIFECYCLE_STATES,
    nullable: true,
    example: 'Draft',
  })
  @Expose()
  fromState!: LifecycleState | null;

  @ApiProperty({
    description: 'New lifecycle state.',
    enum: LIFECYCLE_STATES,
    example: 'In Review',
  })
  @Expose()
  toState!: LifecycleState;

  @ApiProperty({
    description: 'Identifier of the actor who triggered the transition.',
    format: 'uuid',
    nullable: true,
  })
  @Expose()
  actorId!: string | null;

  @ApiProperty({
    description: 'Display name of the actor who triggered the transition.',
    nullable: true,
  })
  @Expose()
  actorName!: string | null;

  @ApiProperty({
    description: 'Justification recorded for the transition.',
    nullable: true,
  })
  @Expose()
  reason!: string | null;

  @ApiProperty({
    description: 'Timestamp when the transition occurred.',
    format: 'date-time',
  })
  @Expose()
  createdAt!: Date;

  constructor(partial: Partial<VersionStateHistoryResponseDto>) {
    Object.assign(this, partial);
  }
}
