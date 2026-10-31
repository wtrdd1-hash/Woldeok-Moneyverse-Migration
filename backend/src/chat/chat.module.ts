import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
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
export class ChatModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Middleware runs before session/consent guards, so even denied requests
    // cannot inherit shared cache or referrer policies for private messages.
    consumer.apply((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    }).forRoutes(ChatController);
  }
}
