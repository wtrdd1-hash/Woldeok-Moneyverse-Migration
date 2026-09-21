import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { SpaceController } from './space.controller';
import { PostgresSpaceRepository } from './space.repository';
import { SpaceService } from './space.service';

@Module({
  imports: [AuthModule],
  controllers: [SpaceController],
  providers: [
    {
      provide: PostgresSpaceRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new PostgresSpaceRepository(pool) : null),
    },
    {
      provide: SpaceService,
      inject: [PostgresSpaceRepository],
      useFactory: (repo: PostgresSpaceRepository | null) => (repo ? new SpaceService(repo) : null),
    },
  ],
  exports: [SpaceService, PostgresSpaceRepository],
})
export class SpaceModule {}
