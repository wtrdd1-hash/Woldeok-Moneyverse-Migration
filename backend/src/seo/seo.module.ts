import { Module } from '@nestjs/common';
import { SeoController, IndexNowKeyController } from './seo.controller';
import { SeoService } from './seo.service';
import { SeoCrawlerAuditService } from './seo-crawler-audit.service';
import { SeoDailyDigestService } from './seo-daily-digest.service';
import { SeoCronPingService } from './seo-cron-ping.service';

@Module({
  controllers: [SeoController, IndexNowKeyController],
  providers: [SeoService, SeoCrawlerAuditService, SeoDailyDigestService, SeoCronPingService],
  exports: [SeoService, SeoCrawlerAuditService, SeoDailyDigestService, SeoCronPingService],
})
export class SeoModule {}
