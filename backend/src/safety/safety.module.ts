import { Module } from '@nestjs/common';
import { SafetyController } from './safety.controller';
import { SafetyService } from './safety.service';
import { SafetyRepository } from './safety.repository';
import { AuthModule } from '../auth/auth.module';
import { PG_POOL } from '../core/pool.provider';
import type { Queryable } from '../core/db';

@Module({
  imports: [AuthModule],
  controllers: [SafetyController],
  providers: [
    {
      provide: SafetyRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new SafetyRepository(pool) : null),
    },
    {
      provide: SafetyService,
      inject: [SafetyRepository],
      useFactory: (repo: SafetyRepository | null) => (repo ? new SafetyService(repo) : null),
    },
  ],
  exports: [SafetyService, SafetyRepository],
})
export class SafetyModule {}
