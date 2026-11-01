import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AuthModule } from '../auth/auth.module';
import { EarlyGameController } from './early-game.controller';
import { EARLY_GAME_REPOSITORY_PROVIDER } from './early-game.provider';

/**
 * The third module to register `EARLY_GAME_REPOSITORY_PROVIDER`, and
 * deliberately the same provider object as the other two rather than a fourth
 * copy of its factory: the rule that the repository is null with no
 * DATABASE_URL has one home, so it cannot drift between the modules that
 * answer for 16.1.
 */
@Module({
  imports: [AuthModule],
  controllers: [EarlyGameController],
  providers: [EARLY_GAME_REPOSITORY_PROVIDER],
})
export class EarlyGameModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Owner event and claim responses, including guard refusals, must never
    // inherit public edge caches. Middleware runs before session/consent/CSRF.
    consumer.apply((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    }).forRoutes(EarlyGameController);
  }
}
