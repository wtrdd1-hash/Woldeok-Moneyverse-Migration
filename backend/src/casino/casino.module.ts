import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { CasinoController } from './casino.controller';
import { CasinoRepository } from './casino.repository';
import { PvpArenaController } from './pvp-arena.controller';
import { PvpArenaRepository } from './pvp-arena.repository';

@Module({
  imports: [AuthModule],
  controllers: [CasinoController, PvpArenaController],
  providers: [
    {
      provide: CasinoRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new CasinoRepository(pool) : null),
    },
    {
      provide: PvpArenaRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new PvpArenaRepository(pool) : null),
    },
  ],
  exports: [CasinoRepository, PvpArenaRepository],
})
export class CasinoModule {}
