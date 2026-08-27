import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { PrivacyController } from './privacy.controller';
import { PostgresPrivacyRequestRepository } from './privacy.repository';
import { PrivacyRequestService } from './privacy.service';

@Module({
  imports: [AuthModule],
  controllers: [PrivacyController],
  providers: [
    {
      provide: PrivacyRequestService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new PrivacyRequestService(new PostgresPrivacyRequestRepository(pool)) : null,
    },
  ],
  exports: [PrivacyRequestService],
})
export class PrivacyModule {}
