import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { EARLY_GAME_REPOSITORY_PROVIDER } from '../early-game/early-game.provider';
import { EngagementController } from './engagement.controller';
import { EngagementRepository } from './engagement.repository';

@Module({
  imports: [AuthModule],
  controllers: [EngagementController],
  providers: [
    {
      // A factory, not a class provider. `EngagementRepository`'s constructor
      // takes `Queryable`, which is an interface: TypeScript erases it to
      // `Object` in design:paramtypes, so Nest has no token to resolve and
      // AppModule throws at bootstrap -- taking the whole API down, not just
      // /engagement.
      //
      // Null with no DATABASE_URL, because the application has to boot and
      // answer 503 on these routes rather than refuse to start.
      provide: EngagementRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new EngagementRepository(pool) : null),
    },
    // The weekly goals and the collection books are served from this
    // controller, so its repository is provided here too. The same exported
    // provider object the progression module registers -- one factory, so the
    // null-when-offline rule cannot drift between the two.
    EARLY_GAME_REPOSITORY_PROVIDER,
  ],
})
export class EngagementModule {}
