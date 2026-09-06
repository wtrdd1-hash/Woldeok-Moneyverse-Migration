import { Global, Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { DiscordAlertService } from './discord-alert.service';

@Global()
@Module({
  imports: [CoreModule],
  providers: [DiscordAlertService],
  exports: [DiscordAlertService],
})
export class DiscordAlertModule {}
