import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { CasinoController } from './casino.controller';
import { CasinoRepository } from './casino.repository';

@Module({
  imports: [AuthModule],
  controllers: [CasinoController],
  providers: [
    {
      // A factory, not a class provider. `CasinoRepository`'s constructor
      // takes `Queryable`, which is an interface: TypeScript erases it to
      // `Object` in design:paramtypes, so Nest has no token to resolve and
      // AppModule throws at bootstrap -- taking the whole API down, not just
      // /casino.
      //
      // Null with no DATABASE_URL, because the application has to boot and
      // answer 503 on these routes rather than refuse to start.
      provide: CasinoRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new CasinoRepository(pool) : null),
    },
  ],
})
export class CasinoModule {}
