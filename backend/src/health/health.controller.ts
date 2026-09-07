import { Controller, Get, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { SkipInternalToken } from '../auth/guards/skip-internal-token.decorator';

/**
 * VERSION_NEUTRAL alongside the global prefix exclusion: excluding the
 * controller from the /api prefix alone still leaves URI versioning applied,
 * which moved this route to /v1/health. A container liveness probe and the
 * route map both expect the bare /health it has always had, and a probe that
 * silently 404s reads as a dead service.
 */
@Controller({ path: 'health', version: VERSION_NEUTRAL })
@SkipInternalToken()
export class HealthController {
  @Get()
  @Version(VERSION_NEUTRAL)
  @ApiOperation({ summary: 'Liveness probe' })
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
