import { Injectable, NotFoundException } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { isAbsolute, normalize, resolve, sep } from 'node:path';

@Injectable()
export class PublicPortalAssetsService {
  private static readonly UPLOADS_DIRECTORY = resolve(process.cwd(), 'uploads');

  async readPublishedBpmnXml(filePath: string): Promise<string> {
    const absoluteFilePath = this.resolveUploadsPath(filePath);

    try {
      return await readFile(absoluteFilePath, 'utf8');
    } catch {
      throw new NotFoundException('Published BPMN asset file not found');
    }
  }

  private resolveUploadsPath(filePath: string): string {
    if (isAbsolute(filePath)) {
      throw new NotFoundException('Published BPMN asset file not found');
    }

    const normalizedFilePath = normalize(filePath);
    const absoluteFilePath = resolve(
      PublicPortalAssetsService.UPLOADS_DIRECTORY,
      normalizedFilePath,
    );
    const uploadsDirectoryWithSeparator = `${PublicPortalAssetsService.UPLOADS_DIRECTORY}${sep}`;

    if (
      absoluteFilePath !== PublicPortalAssetsService.UPLOADS_DIRECTORY &&
      !absoluteFilePath.startsWith(uploadsDirectoryWithSeparator)
    ) {
      throw new NotFoundException('Published BPMN asset file not found');
    }

    return absoluteFilePath;
  }
}
