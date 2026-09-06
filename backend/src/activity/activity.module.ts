import { Module } from '@nestjs/common';
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
export class ActivityModule {}
