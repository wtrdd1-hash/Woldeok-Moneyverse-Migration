import { Controller, Get, Header, VERSION_NEUTRAL, Version } from '@nestjs/common';
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

/**
 * Backend-owned immutable runtime identity. URI versioning is neutral while
 * the global /api prefix remains, so operators can verify the backend process * without trusting the frontend build or repository head as runtime evidence.
 */
@Controller({ path: 'version', version: VERSION_NEUTRAL })
@SkipInternalToken()
export class VersionController {
  @Get()
  @Version(VERSION_NEUTRAL)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Backend runtime identity' })
  check(): { id: string } {
    return { id: process.env.BUILD_ID ?? 'unknown' };
  }
}
