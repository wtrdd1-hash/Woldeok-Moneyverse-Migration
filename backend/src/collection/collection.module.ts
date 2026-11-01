import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
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
export class CollectionModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Owner collection and curation data, including guard failures, must not
    // be cached or indexed. Middleware executes before authentication/CSRF.
    consumer.apply((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    }).forRoutes(CollectionController);
  }
}

