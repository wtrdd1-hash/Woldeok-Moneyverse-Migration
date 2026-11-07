import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { EARLY_GAME_REPOSITORY_PROVIDER } from '../early-game/early-game.provider';
import { ProgressionController } from './progression.controller';
import { ProgressionRepository } from './progression.repository';

@Module({
  imports: [AuthModule],
  controllers: [ProgressionController],
  providers: [
    {
      // A factory, not a class provider. `ProgressionRepository`'s constructor
      // takes `Queryable`, which is an interface: TypeScript erases it to
      // `Object` in design:paramtypes, so Nest has no token to resolve and
      // AppModule throws at bootstrap -- taking the whole API down, not just
      // /progression.
      //
      // Null with no DATABASE_URL, because the application has to boot and
      // answer 503 on these routes rather than refuse to start.
      provide: ProgressionRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new ProgressionRepository(pool) : null),
    },
    // The unlock ladder is served from this controller, so its repository is
    // provided here too. One exported provider object rather than a second
    // copy of the factory: the rule that a missing DATABASE_URL yields null
    // instead of a bootstrap failure is written once and applies to both
    // modules that serve part of 16.1.
    EARLY_GAME_REPOSITORY_PROVIDER,
  ],
})
export class ProgressionModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Owner growth, credit and loan data must remain private even when a
    // session, consent or CSRF guard rejects the request before its handler.
    consumer.apply((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    }).forRoutes(ProgressionController);
  }
}
