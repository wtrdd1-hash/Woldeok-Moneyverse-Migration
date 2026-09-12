import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ContentModule } from '../content/content.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { BoardController } from './board.controller';
import { BoardImageController } from './board-image.controller';
import { PostgresBoardRepository } from './board.repository';
import { BoardService } from './board.service';
import { PublicBoardController } from './public-board.controller';
import { PublicBoardImageController } from './public-board-image.controller';
import { PublicBoardService } from './public-board.service';
import { PublicStockCommunityController, StockCommunityController } from './stock-community.controller';
import { StockCommunityService } from './stock-community.service';

@Module({
  imports: [AuthModule, ContentModule],
  controllers: [
    BoardController, BoardImageController, PublicBoardController, PublicBoardImageController,
    StockCommunityController, PublicStockCommunityController,
  ],
  providers: [
    {
      provide: BoardService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new BoardService(new PostgresBoardRepository(pool)) : null,
    },
    {
      provide: PublicBoardService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new PublicBoardService(pool) : null),
    },
    {
      provide: StockCommunityService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new StockCommunityService(pool) : null),
    },
  ],
  exports: [BoardService, PublicBoardService, StockCommunityService],
})
export class BoardModule {}
