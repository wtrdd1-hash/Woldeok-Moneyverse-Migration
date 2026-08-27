import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { PostgresMinecraftApprovedOperationRepository } from '@moneyverse/minecraft-core';
import { MinecraftApprovedOperationService } from '@moneyverse/minecraft-core';
import { MinecraftController } from './minecraft.controller';

@Module({
  imports: [AuthModule],
  controllers: [MinecraftController],
  providers: [
    {
      provide: MinecraftApprovedOperationService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool
          ? new MinecraftApprovedOperationService(
              new PostgresMinecraftApprovedOperationRepository(pool),
            )
          : null,
    },
  ],
  exports: [MinecraftApprovedOperationService],
})
export class MinecraftModule {}
