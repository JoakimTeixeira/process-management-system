import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdParamDto {
  @ApiProperty({
    description: 'Unique identifier for the target record.',
    format: 'uuid',
  })
  @IsUUID()
  id!: string;
}

export class ProcessIdParamDto {
  @ApiProperty({
    description: 'Unique identifier for the parent process.',
    format: 'uuid',
  })
  @IsUUID()
  processId!: string;
}

export class ProcessVersionIdParamDto {
  @ApiProperty({
    description: 'Unique identifier for the parent process version.',
    format: 'uuid',
  })
  @IsUUID()
  processVersionId!: string;
}

export class ProcessVersionAssetParamDto {
  @ApiProperty({
    description: 'Unique identifier for the parent process version.',
    format: 'uuid',
  })
  @IsUUID()
  processVersionId!: string;

  @ApiProperty({
    description: 'Unique identifier for the requested asset.',
    format: 'uuid',
  })
  @IsUUID()
  assetId!: string;
}
