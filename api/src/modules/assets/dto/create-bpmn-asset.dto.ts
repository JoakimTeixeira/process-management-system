import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { trimString } from '../../../common/utils/trim-string-transform.util';

export class CreateBpmnAssetDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  caption!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @Matches(/\.(bpmn|xml)$/i, {
    message: 'filePath must point to a BPMN or XML file',
  })
  filePath!: string;

  @Transform(trimString)
  @IsString()
  @Matches(/^(application|text)\/xml$/i, {
    message: 'mimeType must be application/xml or text/xml',
  })
  mimeType!: string;
}
