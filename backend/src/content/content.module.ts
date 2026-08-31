import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { ContentController } from './content.controller';
import { MediaController } from './media.controller';
import { MemberPhotoController } from './member-photo.controller';
import { MemberPhotoRepository } from './member-photo.repository';
import { PhotoUploadController } from './photo-upload.controller';
import { PrivateImageStorage } from './private-image-storage';
import { PostgresContentRepository } from './content.repository';
import { ContentService } from './content.service';

@Module({
  imports: [AuthModule],
  controllers: [ContentController, MediaController, MemberPhotoController, PhotoUploadController],
  providers: [
    {
      provide: PrivateImageStorage,
      useFactory: () =>
        new PrivateImageStorage(process.env.PHOTO_STORAGE_DIR ?? '/data/moneyverse/photos'),
    },
    {
      // A factory, not a class provider: the constructor takes `Queryable`,
      // which TypeScript erases to `Object`, so Nest would have no token to
      // resolve and AppModule would throw at bootstrap.
      provide: MemberPhotoRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new MemberPhotoRepository(pool) : null),
    },
    {
      provide: ContentService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new ContentService(new PostgresContentRepository(pool)) : null,
    },
  ],
  exports: [ContentService, MemberPhotoRepository, PrivateImageStorage],
})
export class ContentModule {}
