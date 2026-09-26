import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { EARLY_GAME_REPOSITORY_PROVIDER } from '../early-game/early-game.provider';
import { DopamineController } from './dopamine.controller';
import { EngagementController } from './engagement.controller';
import { EngagementRepository } from './engagement.repository';

@Module({
  imports: [AuthModule],
  controllers: [EngagementController, DopamineController],
  providers: [
    {
      provide: EngagementRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new EngagementRepository(pool) : null),
    },
    EARLY_GAME_REPOSITORY_PROVIDER,
  ],
})
export class EngagementModule {}
