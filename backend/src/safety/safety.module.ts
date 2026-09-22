import { Module } from '@nestjs/common';
import { SafetyController } from './safety.controller';
import { SafetyService } from './safety.service';
import { SafetyRepository } from './safety.repository';
import { CoreModule } from '../core/core.module';
import { AuthModule } from '../auth/auth.module';
import { DB_POOL } from '../core/db';
import type { Queryable } from '../core/db';

@Module({
  imports: [CoreModule, AuthModule],
  controllers: [SafetyController],
  providers: [
    SafetyService,
    {
      provide: SafetyRepository,
      useFactory: (pool: Queryable) => new SafetyRepository(pool),
      inject: [DB_POOL],
    },
  ],
  exports: [SafetyService, SafetyRepository],
})
export class SafetyModule {}
