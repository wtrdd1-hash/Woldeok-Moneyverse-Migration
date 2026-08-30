import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { ContentController } from './content.controller';
import { MediaController } from './media.controller';
import { PhotoUploadController } from './photo-upload.controller';
import { PrivateImageStorage } from './private-image-storage';
import { PostgresContentRepository } from './content.repository';
import { ContentService } from './content.service';

@Module({
  imports: [AuthModule],
  controllers: [ContentController, MediaController, PhotoUploadController],
  providers: [
    {
      provide: PrivateImageStorage,
      useFactory: () =>
        new PrivateImageStorage(process.env.PHOTO_STORAGE_DIR ?? '/data/moneyverse/photos'),
    },
    {
      provide: ContentService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new ContentService(new PostgresContentRepository(pool)) : null,
    },
  ],
  exports: [ContentService, PrivateImageStorage],
})
export class ContentModule {}
