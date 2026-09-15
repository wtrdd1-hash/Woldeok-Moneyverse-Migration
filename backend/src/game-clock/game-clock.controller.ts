import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GameClockRepository } from './game-clock.repository';

@ApiTags('game-clock')
@Controller('game-clock')
export class GameClockController {
  constructor(@Inject(GameClockRepository) private readonly clock: GameClockRepository | null) {}
  @Get()
  @ApiOperation({ summary: 'Read the authoritative accelerated Moneyverse server day/week' })
  current() {
    if (!this.clock) throw new ServiceUnavailableException('game clock is unavailable');
    return this.clock.current();
  }
}
