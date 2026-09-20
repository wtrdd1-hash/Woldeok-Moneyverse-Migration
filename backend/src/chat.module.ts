import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import type { Queryable } from './core/db';
import { PG_POOL } from './core/pool.provider';
import { ChatController } from './chat.controller';
import { ChatRepository } from './chat.repository';
@Module({ imports:[AuthModule], controllers:[ChatController], providers:[{ provide: ChatRepository, inject:[PG_POOL], useFactory:(pool: Queryable|null)=>pool ? new ChatRepository(pool):null }] })
export class ChatModule {}
