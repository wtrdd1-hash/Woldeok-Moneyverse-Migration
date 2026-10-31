import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { AdminSupportController, SupportController } from './support.controller';
import { SupportRepository } from './support.repository';

@Module({
  imports: [AuthModule],
  controllers: [SupportController, AdminSupportController],
  providers: [{ provide: SupportRepository, inject: [PG_POOL], useFactory: (pool: Queryable | null) => pool ? new SupportRepository(pool) : null }],
  exports: [SupportRepository],
})
export class SupportModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Controller @Header decorators run after guards; rejected requests need
    // the same private boundary as successful member and administrator reads.
    consumer.apply((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    }).forRoutes(SupportController, AdminSupportController);
  }
}
