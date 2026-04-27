import { Module } from '@nestjs/common';

import { PublicCatalogRepository } from './public-catalog.repository';
import { PublicPortalController } from './public-portal.controller';
import { PublicPortalAssetsService } from './public-portal-assets.service';
import { PublicProcessesRepository } from './public-processes.repository';
import { PublicProceduresRepository } from './public-procedures.repository';
import { PublicPortalService } from './public-portal.service';

@Module({
  controllers: [PublicPortalController],
  providers: [
    PublicCatalogRepository,
    PublicProcessesRepository,
    PublicProceduresRepository,
    PublicPortalAssetsService,
    PublicPortalService,
  ],
  exports: [PublicPortalService],
})
export class PublicPortalModule {}
