import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { AdminEconomyController } from './economy.controller';
import { EconomyConsoleRepository } from './economy.repository';

/**
 * Its own module rather than another entry in `AdminModule`, so the economy
 * console can be registered, moved or taken out of the graph without editing
 * a file five other surfaces share.
 */
@Module({
  imports: [AuthModule],
  controllers: [AdminEconomyController],
  providers: [
    {
      // A factory, not a class provider. `EconomyConsoleRepository`'s
      // constructor takes `Queryable`, which is an interface: TypeScript
      // erases it to `Object` in design:paramtypes, so Nest has no token to
      // resolve and AppModule throws at bootstrap -- taking the whole API
      // down, not just /admin/economy.
      //
      // Null with no DATABASE_URL, because the application has to boot and
      // answer 503 on these routes rather than refuse to start.
      provide: EconomyConsoleRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new EconomyConsoleRepository(pool) : null,
    },
  ],
})
export class AdminEconomyModule {}
