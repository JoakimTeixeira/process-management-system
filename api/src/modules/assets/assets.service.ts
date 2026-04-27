import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

import { Role } from '../../common/enums/role.enum';
import { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ProcessVersionsRepository } from '../process_versions/process-versions.repository';
import { WorkflowAuthorizationService } from '../workflow_support/workflow-authorization.service';
import type { CreateBpmnAssetDto } from './dto/create-bpmn-asset.dto';
import type { AssetContentResponseDto } from './dto/asset-content-response.dto';
import type { AssetRecord } from './assets.repository';
import { AssetsRepository } from './assets.repository';

@Injectable()
export class AssetsService {
  private static readonly UPLOADS_DIRECTORY = resolve(process.cwd(), 'uploads');
  private static readonly BPMN_DIRECTORY = resolve(
    AssetsService.UPLOADS_DIRECTORY,
    'backoffice',
    'bpmn',
  );

  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly processVersionsRepository: ProcessVersionsRepository,
    private readonly workflowAuthorizationService: WorkflowAuthorizationService,
    private readonly auditLogWriterService: AuditLogWriterService,
  ) {}

  async createBpmnAsset(
    processVersionId: string,
    createBpmnAssetDto: CreateBpmnAssetDto,
    file: {
      buffer: Buffer;
      originalname?: string;
      mimetype?: string;
    },
    currentUser: AuthenticatedUser,
  ): Promise<AssetRecord> {
    this.assertEditorRole(currentUser);
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

    if (!file?.buffer || file.buffer.length === 0) {
      throw new BadRequestException('A BPMN file upload is required');
    }

    const fileMetadata = await this.storeAndValidateBpmnFile(
      processVersionId,
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    const asset = await this.assetsRepository.createBpmnAsset({
      processVersionId,
      caption: createBpmnAssetDto.caption,
      filePath: fileMetadata.filePath,
      mimeType: fileMetadata.mimeType,
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
    currentUser: AuthenticatedUser,
  ): Promise<AssetRecord[]> {
    this.assertBackofficeContentRole(currentUser);
    return await this.assetsRepository.findByProcessVersionId(processVersionId);
  }

  async getAssetContent(
    processVersionId: string,
    assetId: string,
    currentUser: AuthenticatedUser,
  ): Promise<AssetContentResponseDto> {
    this.assertBackofficeContentRole(currentUser);
    const asset = await this.assetsRepository.findById(assetId);

    if (!asset || asset.processVersionId !== processVersionId) {
      throw new NotFoundException('Asset not found');
    }

    const absoluteFilePath = resolve(
      AssetsService.UPLOADS_DIRECTORY,
      asset.filePath,
    );
    const content = await this.readBpmnFileContent(absoluteFilePath);

    return {
      id: asset.id,
      caption: asset.caption,
      filePath: asset.filePath,
      mimeType: asset.mimeType,
      content,
    };
  }

  private async storeAndValidateBpmnFile(
    processVersionId: string,
    buffer: Buffer,
    originalName?: string,
    mimeType?: string,
  ): Promise<{
    checksum: string;
    sizeBytes: number;
    filePath: string;
    mimeType: string;
  }> {
    const content = buffer.toString('utf8');

    if (!this.isValidBpmnXml(content)) {
      throw new ConflictException(
        'The uploaded file must contain a valid BPMN/XML document',
      );
    }

    await mkdir(AssetsService.BPMN_DIRECTORY, { recursive: true });

    const extension = this.getSafeExtension(originalName);
    const fileName = `${processVersionId}-${randomUUID()}${extension}`;
    const relativeFilePath = `backoffice/bpmn/${fileName}`.replace(/\\/g, '/');
    const absoluteFilePath = resolve(
      AssetsService.UPLOADS_DIRECTORY,
      relativeFilePath,
    );

    await writeFile(absoluteFilePath, buffer);

    return {
      checksum: createHash('sha256').update(content).digest('hex'),
      sizeBytes: Buffer.byteLength(content),
      filePath: relativeFilePath,
      mimeType:
        mimeType && mimeType.trim() !== '' ? mimeType : 'application/xml',
    };
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

  private getSafeExtension(originalName?: string): '.bpmn' | '.xml' {
    const extension = extname(originalName ?? '').toLowerCase();

    return extension === '.xml' ? '.xml' : '.bpmn';
  }

  private assertEditorRole(currentUser: AuthenticatedUser): void {
    if (currentUser.role !== Role.EDITOR) {
      throw new ForbiddenException('Only editors can manage BPMN assets');
    }
  }

  private assertBackofficeContentRole(currentUser: AuthenticatedUser): void {
    if (
      ![Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER].includes(
        currentUser.role,
      )
    ) {
      throw new ForbiddenException('Only content roles can access BPMN assets');
    }
  }
}
