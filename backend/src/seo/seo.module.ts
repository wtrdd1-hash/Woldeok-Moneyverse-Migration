import { Module } from '@nestjs/common';
import { SeoController, IndexNowKeyController } from './seo.controller';
import { SeoService } from './seo.service';
import { SeoCrawlerAuditService } from './seo-crawler-audit.service';

@Module({
  controllers: [SeoController, IndexNowKeyController],
  providers: [SeoService, SeoCrawlerAuditService],
  exports: [SeoService, SeoCrawlerAuditService],
})
export class SeoModule {}
