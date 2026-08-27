import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { BoardController } from './board.controller';
import { PostgresBoardRepository } from './board.repository';
import { BoardService } from './board.service';

@Module({
  imports: [AuthModule],
  controllers: [BoardController],
  providers: [
    {
      provide: BoardService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new BoardService(new PostgresBoardRepository(pool)) : null,
    },
  ],
  exports: [BoardService],
})
export class BoardModule {}
