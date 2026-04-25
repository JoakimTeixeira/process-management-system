import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { isAbsolute, normalize, resolve, sep } from 'node:path';

import { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ProcessVersionsRepository } from '../process_versions/process-versions.repository';
import { WorkflowAuthorizationService } from '../workflow_support/workflow-authorization.service';
import type { CreateBpmnAssetDto } from './dto/create-bpmn-asset.dto';
import type { AssetRecord } from './assets.repository';
import { AssetsRepository } from './assets.repository';

@Injectable()
export class AssetsService {
  private static readonly UPLOADS_DIRECTORY = resolve(process.cwd(), 'uploads');

  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly processVersionsRepository: ProcessVersionsRepository,
    private readonly workflowAuthorizationService: WorkflowAuthorizationService,
    private readonly auditLogWriterService: AuditLogWriterService,
  ) {}

  async createBpmnAsset(
    processVersionId: string,
    createBpmnAssetDto: CreateBpmnAssetDto,
    currentUser: AuthenticatedUser,
  ): Promise<AssetRecord> {
    const processVersion =
      await this.processVersionsRepository.findById(processVersionId);

    if (!processVersion) {
      throw new NotFoundException('Process version not found');
    }

    if (processVersion.lifecycleState !== 'Draft') {
      throw new ConflictException(
        'Assets can only be uploaded for Draft versions',
      );
    }

    await this.workflowAuthorizationService.assertSameTeamAsProcessVersionOwner(
      processVersionId,
      currentUser,
    );

    const fileMetadata = await this.readAndValidateBpmnFile(
      createBpmnAssetDto.filePath,
      createBpmnAssetDto.mimeType,
    );

    const asset = await this.assetsRepository.createBpmnAsset({
      processVersionId,
      caption: createBpmnAssetDto.caption,
      filePath: createBpmnAssetDto.filePath,
      mimeType: createBpmnAssetDto.mimeType,
      checksum: fileMetadata.checksum,
      sizeBytes: fileMetadata.sizeBytes,
      actorId: currentUser.id,
    });

    await this.auditLogWriterService.create({
      entityType: 'asset',
      entityId: asset.id,
      action: 'UPLOAD',
      actorId: currentUser.id,
      reasonForChange: 'Uploaded BPMN asset via API',
      newData: asset,
    });

    return asset;
  }

  async listByProcessVersionId(
    processVersionId: string,
  ): Promise<AssetRecord[]> {
    return await this.assetsRepository.findByProcessVersionId(processVersionId);
  }

  private async readAndValidateBpmnFile(
    filePath: string,
    mimeType: string,
  ): Promise<{ checksum: string; sizeBytes: number }> {
    const absoluteFilePath = this.resolveUploadsPath(filePath);
    const content = await this.readBpmnFileContent(absoluteFilePath);

    if (!/^(application|text)\/xml$/i.test(mimeType)) {
      throw new ConflictException('BPMN assets must use an XML media type');
    }

    if (!this.isValidBpmnXml(content)) {
      throw new ConflictException(
        'The referenced file must contain a valid BPMN/XML document',
      );
    }

    return {
      checksum: createHash('sha256').update(content).digest('hex'),
      sizeBytes: Buffer.byteLength(content),
    };
  }

  private resolveUploadsPath(filePath: string): string {
    if (isAbsolute(filePath)) {
      throw new ConflictException(
        'filePath must be relative to the uploads directory',
      );
    }

    const normalizedFilePath = normalize(filePath);
    const absoluteFilePath = resolve(
      AssetsService.UPLOADS_DIRECTORY,
      normalizedFilePath,
    );
    const uploadsDirectoryWithSeparator = `${AssetsService.UPLOADS_DIRECTORY}${sep}`;

    if (
      absoluteFilePath !== AssetsService.UPLOADS_DIRECTORY &&
      !absoluteFilePath.startsWith(uploadsDirectoryWithSeparator)
    ) {
      throw new ConflictException(
        'filePath must stay within the uploads directory',
      );
    }

    return absoluteFilePath;
  }

  private async readBpmnFileContent(absoluteFilePath: string): Promise<string> {
    try {
      return await readFile(absoluteFilePath, 'utf8');
    } catch {
      throw new NotFoundException('Referenced BPMN file was not found');
    }
  }

  private isValidBpmnXml(content: string): boolean {
    return (
      /<[^>]*definitions\b/i.test(content) && /<[^>]*process\b/i.test(content)
    );
  }
}
