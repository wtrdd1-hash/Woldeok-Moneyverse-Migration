import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { BusinessController } from './business.controller';
import { PostgresBusinessRepository } from './business.repository';
import { BusinessService } from './business.service';

@Module({
  imports: [AuthModule],
  controllers: [BusinessController],
  providers: [
    {
      provide: BusinessService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new BusinessService(new PostgresBusinessRepository(pool)) : null,
    },
  ],
  exports: [BusinessService],
})
export class BusinessModule {}
