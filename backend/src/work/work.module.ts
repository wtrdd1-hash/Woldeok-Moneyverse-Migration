import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { WorkController } from './work.controller';
import { WorkRepository } from './work.repository';

@Module({
  imports: [AuthModule],
  controllers: [WorkController],
  providers: [
    {
      // A factory, not a class provider. `WorkRepository`'s constructor takes
      // `Queryable`, which is an interface: TypeScript erases it to `Object`
      // in design:paramtypes, so Nest has no token to resolve and AppModule
      // throws at bootstrap -- taking the whole API down, not just /work.
      //
      // Null with no DATABASE_URL, because the application has to boot and
      // answer 503 on these routes rather than refuse to start.
      provide: WorkRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new WorkRepository(pool) : null),
    },
  ],
})
export class WorkModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Work is entirely owner-scoped; guard refusals must not inherit public caching.
    consumer.apply((_request: Request, response: Response, next: NextFunction) => {
      response.setHeader('Cache-Control', 'private, no-store');
      response.setHeader('X-Robots-Tag', 'noindex');
      response.setHeader('Referrer-Policy', 'no-referrer');
      next();
    }).forRoutes(WorkController);
  }
}
