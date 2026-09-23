import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CoreModule } from '../core/core.module';
import { CollectionController } from './collection.controller';
import { PostgresCollectionRepository } from './collection.repository';
import { CollectionService } from './collection.service';

@Module({
  imports: [CoreModule, AuthModule],
  controllers: [CollectionController],
  providers: [PostgresCollectionRepository, CollectionService],
  exports: [CollectionService],
})
export class CollectionModule {}

