import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipInternalToken } from '../auth/guards/skip-internal-token.decorator';
import { MacroPulseService, type MacroPulsePayload } from './macro-pulse.service';

@ApiTags('economy')
@Controller('economy/macro-pulse')
export class MacroPulseController {
  constructor(private readonly macroPulseService: MacroPulseService) {}

  @Get()
  @SkipInternalToken()
  @ApiOperation({
    summary: 'Get real-time domestic & global macroeconomic indicators and educational insights',
  })
  getMacroPulse(): MacroPulsePayload {
    return this.macroPulseService.getMacroPulse();
  }
}
