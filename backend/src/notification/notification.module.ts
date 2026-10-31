import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AuthModule } from '../auth/auth.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [AuthModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Run before session/consent/CSRF guards: owner counts and write receipts,
    // including rejected requests, must never inherit a public edge cache.
    consumer.apply((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    }).forRoutes(NotificationController);
  }
}
