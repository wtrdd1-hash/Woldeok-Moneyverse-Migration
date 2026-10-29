import { Module } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { AuthModule } from '../auth/auth.module';
import { PG_POOL } from '../core/pool.provider';
import { HelpController } from './help.controller';
import { HelpReportController } from './help-report.controller';
import { SupportModule } from '../support/support.module';
import { AdminHelpController } from './help-admin.controller';
import { HelpRepository } from './help.repository';

@Module({
  imports: [AuthModule, SupportModule],
  controllers: [HelpController, HelpReportController, AdminHelpController],
  providers: [{ provide: HelpRepository, inject: [PG_POOL], useFactory: (pool: Queryable | null) => pool ? new HelpRepository(pool) : null }],
})
export class HelpModule {}
