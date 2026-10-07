import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipInternalToken } from '../auth/guards/skip-internal-token.decorator';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { HotTimeService, type HotTimePayload, type HotTimeBuffItem } from './hot-time.service';

export class ToggleHotTimeDto {
  readonly buffKey!: string;
  readonly active!: boolean;
}

@ApiTags('economy')
@Controller('economy/hot-time')
export class HotTimeController {
  constructor(private readonly hotTimeService: HotTimeService) {}

  @Get('active')
  @SkipInternalToken()
  @ApiOperation({
    summary: 'Get all currently active live economic hot-time buffs with countdowns',
  })
  async getActiveHotTimes(): Promise<HotTimePayload> {
    return this.hotTimeService.getActiveHotTimes();
  }

  @Patch('toggle')
  @UseGuards(SessionGuard, AuthenticatedGuard, AdminGuard)
  @ApiOperation({
    summary: 'Operator toggle for hot time buffs',
  })
  async toggleHotTime(@Body() body: ToggleHotTimeDto): Promise<{ success: boolean; buff: HotTimeBuffItem | null }> {
    const buff = await this.hotTimeService.toggleHotTime(body.buffKey, body.active);
    return { success: !!buff, buff };
  }
}
