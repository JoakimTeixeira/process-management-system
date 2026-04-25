import { IsUUID } from 'class-validator';

export class IdParamDto {
  @IsUUID()
  id!: string;
}

export class ProcessIdParamDto {
  @IsUUID()
  processId!: string;
}

export class ProcessVersionIdParamDto {
  @IsUUID()
  processVersionId!: string;
}
