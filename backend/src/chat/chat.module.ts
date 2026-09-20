import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { ChatController } from './chat.controller';
import { PostgresChatRepository } from './chat.repository';
import { ChatService } from './chat.service';

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [
    {
      provide: PostgresChatRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new PostgresChatRepository(pool) : null),
    },
    {
      provide: ChatService,
      inject: [PostgresChatRepository],
      useFactory: (repo: PostgresChatRepository | null) => (repo ? new ChatService(repo) : null),
    },
  ],
  exports: [ChatService, PostgresChatRepository],
})
export class ChatModule {}
