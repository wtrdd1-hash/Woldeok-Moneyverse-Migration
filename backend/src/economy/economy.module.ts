import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { CentralBankService } from './monetary/central-bank.service';
import { MintBureauService } from './monetary/mint-bureau.service';
import { MonetaryController } from './monetary/monetary.controller';
import { QuantController } from './quant.controller';
import { PostgresEconomyReconciliationRepository } from './reconciliation.repository';
import { ReconciliationController } from './reconciliation.controller';
import { EconomyReconciliationService } from './reconciliation.service';

@Module({
  imports: [AuthModule],
  controllers: [ReconciliationController, QuantController, MonetaryController],
  providers: [
    CentralBankService,
    MintBureauService,
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
  exports: [EconomyReconciliationService, CentralBankService, MintBureauService],
})
export class EconomyModule {}

