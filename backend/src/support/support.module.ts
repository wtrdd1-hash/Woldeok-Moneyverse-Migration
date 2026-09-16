import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { AdminSupportController, SupportController } from './support.controller';
import { SupportRepository } from './support.repository';

@Module({
  imports: [AuthModule],
  controllers: [SupportController, AdminSupportController],
  providers: [{ provide: SupportRepository, inject: [PG_POOL], useFactory: (pool: Queryable | null) => pool ? new SupportRepository(pool) : null }],
  exports: [SupportRepository],
})
export class SupportModule {}
