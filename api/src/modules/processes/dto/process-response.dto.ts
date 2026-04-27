import { Expose } from 'class-transformer';

export interface GovernanceSummaryDto {
  currentAsIsVersion: {
    id: string;
    versionNumber: number;
    lifecycleState: string;
  } | null;
  currentToBeVersion: {
    id: string;
    versionNumber: number;
    lifecycleState: string;
  } | null;
  activeWorkflowVersion: {
    id: string;
    versionNumber: number;
    architectureState: string;
    lifecycleState: string;
    waitingForRole?: string | null;
    nextAction?: string | null;
  } | null;
  versionCounts: {
    total: number;
    archived: number;
  };
}

export class ProcessResponseDto {
  @Expose()
  id!: string;

  @Expose()
  areaId!: string;

  @Expose()
  code!: string;

  @Expose()
  title!: string;

  @Expose()
  description!: string | null;

  @Expose()
  teamId!: string;

  @Expose()
  teamName!: string;

  @Expose()
  ownerId!: string;

  @Expose()
  ownerName!: string;

  @Expose()
  governanceSummary?: GovernanceSummaryDto;

  constructor(partial: Partial<ProcessResponseDto>) {
    Object.assign(this, partial);
  }
}
