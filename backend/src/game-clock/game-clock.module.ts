import { Module } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { GameClockController } from './game-clock.controller';
import { GameClockRepository } from './game-clock.repository';

@Module({
  controllers: [GameClockController],
  providers: [{
    provide: GameClockRepository,
    inject: [PG_POOL],
    useFactory: (pool: Queryable | null) => (pool ? new GameClockRepository(pool) : null),
  }],
})
export class GameClockModule {}
