import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { ClubController } from './club.controller';
import { PostgresClubRepository } from './club.repository';
import { ClubService } from './club.service';

@Module({
  imports: [AuthModule],
  controllers: [ClubController],
  providers: [
    {
      provide: PostgresClubRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new PostgresClubRepository(pool) : null),
    },
    {
      provide: ClubService,
      inject: [PostgresClubRepository],
      useFactory: (repo: PostgresClubRepository | null) => (repo ? new ClubService(repo) : null),
    },
  ],
  exports: [ClubService, PostgresClubRepository],
})
export class ClubModule {}
