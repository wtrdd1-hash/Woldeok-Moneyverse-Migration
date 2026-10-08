import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { DeokiAdvisorController } from './deoki-advisor.controller';
import { DeokiAdvisorRepository } from './deoki-advisor.repository';

@Module({
  imports: [AuthModule],
  controllers: [DeokiAdvisorController],
  providers: [
    {
      provide: DeokiAdvisorRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new DeokiAdvisorRepository(pool) : null),
    },
  ],
  exports: [DeokiAdvisorRepository],
})
export class AdvisorModule {}
