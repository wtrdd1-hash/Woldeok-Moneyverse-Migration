import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { CentralBankService } from './monetary/central-bank.service';
import { MintBureauService } from './monetary/mint-bureau.service';
import { AutoMonetaryRegulationService } from './monetary/auto-monetary-regulation.service';
import { MonetaryController } from './monetary/monetary.controller';
import { QuantController } from './quant.controller';
import { PostgresEconomyReconciliationRepository } from './reconciliation.repository';
import { ReconciliationController } from './reconciliation.controller';
import { EconomyReconciliationService } from './reconciliation.service';

import { MacroPulseController } from './macro-pulse.controller';
import { MacroPulseService } from './macro-pulse.service';
import { HotTimeController } from './hot-time.controller';
import { HotTimeService } from './hot-time.service';

@Module({
  imports: [AuthModule],
  controllers: [
    ReconciliationController,
    QuantController,
    MonetaryController,
    MacroPulseController,
    HotTimeController,
  ],
  providers: [
    CentralBankService,
    MintBureauService,
    AutoMonetaryRegulationService,
    MacroPulseService,
    HotTimeService,
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
  exports: [
    EconomyReconciliationService,
    CentralBankService,
    MintBureauService,
    AutoMonetaryRegulationService,
    MacroPulseService,
  ],
})
export class EconomyModule {}

