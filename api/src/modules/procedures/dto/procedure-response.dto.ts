import { Expose } from 'class-transformer';

export class ProcedureResponseDto {
  @Expose()
  id!: string;

  @Expose()
  processVersionId!: string;

  @Expose()
  processId?: string;

  @Expose()
  processCode?: string;

  @Expose()
  processTitle?: string;

  @Expose()
  versionNumber?: number;

  @Expose()
  lifecycleState?: string;

  @Expose()
  architectureState?: string;

  @Expose()
  code!: string;

  @Expose()
  title!: string;

  @Expose()
  utility!: string;

  @Expose()
  warranty!: string;

  @Expose()
  outcome!: string;

  @Expose()
  policy!: string;

  @Expose()
  activities!: Record<string, unknown>[];

  @Expose()
  inputs!: string[];

  @Expose()
  outputs!: string[];

  constructor(partial: Partial<ProcedureResponseDto>) {
    Object.assign(this, partial);
  }
}
