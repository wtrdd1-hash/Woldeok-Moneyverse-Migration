import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { SeasonController } from './season.controller';
import { PostgresSeasonRepository } from './season.repository';
import { SeasonService } from './season.service';

@Module({
  imports: [AuthModule],
  controllers: [SeasonController],
  providers: [
    {
      provide: SeasonService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new SeasonService(new PostgresSeasonRepository(pool)) : null,
    },
  ],
  exports: [SeasonService],
})
export class SeasonModule {}
