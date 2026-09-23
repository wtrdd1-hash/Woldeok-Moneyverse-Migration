import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { CollectionController } from './collection.controller';
import { PostgresCollectionRepository } from './collection.repository';
import { CollectionService } from './collection.service';

@Module({
  imports: [CoreModule],
  controllers: [CollectionController],
  providers: [PostgresCollectionRepository, CollectionService],
  exports: [CollectionService],
})
export class CollectionModule {}
