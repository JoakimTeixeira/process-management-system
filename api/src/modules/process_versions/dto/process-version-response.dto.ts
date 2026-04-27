import { Expose } from 'class-transformer';

export class ProcessVersionResponseDto {
  @Expose()
  id!: string;

  @Expose()
  processId!: string;

  @Expose()
  versionNumber!: number;

  @Expose()
  lifecycleState!: string;

  @Expose()
  architectureState!: string;

  @Expose()
  title!: string;

  @Expose()
  checklistCompleted!: boolean;

  @Expose()
  derivedFromVersionId!: string | null;

  @Expose()
  changeDescription!: string;

  @Expose()
  reasonForChange!: string;

  @Expose()
  availableActions?: string[];

  constructor(partial: Partial<ProcessVersionResponseDto>) {
    Object.assign(this, partial);
  }
}
