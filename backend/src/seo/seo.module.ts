import { Module } from '@nestjs/common';
import { SeoController, IndexNowKeyController } from './seo.controller';
import { SeoService } from './seo.service';

@Module({
  controllers: [SeoController, IndexNowKeyController],
  providers: [SeoService],
  exports: [SeoService],
})
export class SeoModule {}
