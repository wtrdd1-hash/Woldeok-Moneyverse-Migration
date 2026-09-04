import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { BankController } from './bank.controller';
import { BankRepository } from './bank.repository';

@Module({
  imports: [AuthModule],
  controllers: [BankController],
  providers: [
    {
      provide: BankRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new BankRepository(pool) : null),
    },
  ],
  exports: [BankRepository],
})
export class BankModule {}
