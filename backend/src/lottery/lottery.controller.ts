import { Controller, Get, Header, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LotteryRepository } from './lottery.repository';

@ApiTags('lottery')
@Controller('lottery')
export class LotteryController {
  constructor(@Inject(LotteryRepository) private readonly repository: LotteryRepository | null) {}

  @Get('rounds')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Read verified public lottery round records (no ticket purchase)' })
  async rounds() {
    if (!this.repository) {
      throw new ServiceUnavailableException({ code: 'lottery_rounds_unavailable' });
    }
    try {
      return await this.repository.listRounds();
    } catch {
      // A database outage, schema drift or malformed row is not an empty draw.
      throw new ServiceUnavailableException({ code: 'lottery_rounds_unavailable' });
    }
  }
}
