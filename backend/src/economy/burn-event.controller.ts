import {
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
  Header,
  Req,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';

@ApiTags('Economy Burn Events')
@Controller('economy/events/burn-draw')
export class BurnEventController {
  constructor(@Inject(PG_POOL) private readonly pool: Queryable) {}

  @Get('stats')
  @ApiOperation({ summary: '인플레이션 타파 WLD 소각 드로우 이벤트 실시간 통계 조회' })
  async getEventStats() {
    // A permission error or unavailable source must not look like a verified zero-burn event.
    const unavailable = () => new ServiceUnavailableException('소각 드로우 통계를 확인할 수 없습니다.');
    try {
      const statsRes = await this.pool.query<{
        total_burned: string;
        total_participants: string;
      }>(`
        SELECT
          COALESCE(SUM(burn_amount), 0)::text AS total_burned,
          COUNT(*)::text AS total_participants
        FROM public.burn_event_participations
      `);
      const stats = statsRes.rows[0];
      if (statsRes.rows.length !== 1 ||
          typeof stats?.total_burned !== 'string' ||
          !/^(0|[1-9][0-9]*)$/.test(stats.total_burned) ||
          typeof stats.total_participants !== 'string' ||
          !/^(0|[1-9][0-9]*)$/.test(stats.total_participants) ||
          BigInt(stats.total_participants) > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw unavailable();
      }

      const recentRes = await this.pool.query<{
        display_name: string;
        reward_title: string;
        burn_amount: string;
        created_at: string;
      }>(`
        SELECT
          COALESCE(mp.display_name, '익명의 시민') AS display_name,
          b.reward_title,
          b.burn_amount::text AS burn_amount,
          b.created_at
        FROM public.burn_event_participations b
        LEFT JOIN public.member_profiles mp ON mp.user_id = b.user_id
        ORDER BY b.created_at DESC
        LIMIT 10
      `);

      return {
        success: true,
        totalBurnedWld: stats.total_burned,
        totalParticipants: Number(stats.total_participants),
        recentWinners: recentRes.rows.map((r) => ({
          displayName: r.display_name,
          rewardTitle: r.reward_title,
          burnAmount: r.burn_amount,
          createdAt: r.created_at,
        })),
      };
    } catch {
      // Do not expose SQL errors or silently claim a genuine zero to callers.
      throw unavailable();
    }
  }

  @Post('participate')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @Header('Referrer-Policy', 'no-referrer')
  @ApiOperation({ summary: 'Burn draw unavailable until canonical ledger settlement and replay are verified' })
  participateBurnDraw(@Req() req: RequestWithSession): never {
    requireUserId(req);
    // Migration 263 updates balances directly and records only a legacy entry.
    // Do not issue a success receipt or touch SQL before atomic Economy Core settlement exists.
    throw new ServiceUnavailableException({
      statusCode: 503,
      code: 'BURN_DRAW_LEDGER_UNAVAILABLE',
      message: 'Burn draw is unavailable until verified ledger settlement is implemented.',
    });
  }
}
