import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
