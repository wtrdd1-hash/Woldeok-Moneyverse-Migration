import { Module } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { LotteryController } from './lottery.controller';
import { LotteryRepository } from './lottery.repository';

@Module({
  controllers: [LotteryController],
  providers: [{
    provide: LotteryRepository,
    inject: [PG_POOL],
    useFactory: (db: Queryable | null) => db ? new LotteryRepository(db) : null,
  }],
})
export class LotteryModule {}
