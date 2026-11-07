import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { CoreModule } from '../core/core.module';
import { AuthModule } from '../auth/auth.module';
import { ActivityController } from './activity.controller';
import { ActivityRepository } from './activity.repository';
import { ActivityService } from './activity.service';

@Module({
  imports: [CoreModule, AuthModule],
  controllers: [ActivityController],
  providers: [ActivityRepository, ActivityService],
  exports: [ActivityService],
})
export class ActivityModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Admin activity logs contain member identifiers and telemetry. A guard
    // rejection must not leave a cacheable response, while public event ingest
    // retains its existing HTTP contract.
    consumer.apply((req: Request, res: Response, next: NextFunction) => {
      if (!/\/admin\/activity\/(?:logs|traffic)\/?$/.test(req.path)) return next();
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    }).forRoutes(ActivityController);
  }
}
