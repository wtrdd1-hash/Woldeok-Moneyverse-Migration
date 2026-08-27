import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { PostgresEconomyReconciliationRepository } from './reconciliation.repository';
import { ReconciliationController } from './reconciliation.controller';
import { EconomyReconciliationService } from './reconciliation.service';

@Module({
  imports: [AuthModule],
  controllers: [ReconciliationController],
  providers: [
    {
      provide: EconomyReconciliationService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool
          ? new EconomyReconciliationService({
              repository: new PostgresEconomyReconciliationRepository(pool),
            })
          : null,
    },
  ],
  exports: [EconomyReconciliationService],
})
export class EconomyModule {}
