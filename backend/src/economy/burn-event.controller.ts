import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { RequestWithSession } from '../auth/session.context';
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
  @ApiOperation({ summary: '10,000 WLD 국고 영구 소각 및 한정판 칭호 드로우 참여' })
  async participateBurnDraw(@Req() req: RequestWithSession, @Body() body: { burnAmount?: string | number }) {
    const userId = req.session?.user_id;
    if (!userId) {
      throw new BadRequestException('로그인이 필요한 서비스입니다.');
    }

    // Exact WLD across JSON, Node, and PostgreSQL. Unsafe JSON numbers have
    // already lost information and must be rejected rather than rounded.
    const rawAmount = body?.burnAmount;
    let requested: string;
    if (rawAmount === undefined || rawAmount === null || rawAmount === 0) {
      requested = '10000';
    } else if (typeof rawAmount === 'string' && /^[1-9][0-9]*$/.test(rawAmount)) {
      requested = rawAmount;
    } else if (typeof rawAmount === 'number' && Number.isSafeInteger(rawAmount) && rawAmount > 0) {
      requested = String(rawAmount);
    } else {
      throw new BadRequestException('금액은 정확한 양의 WLD 정수 문자열이어야 합니다.');
    }
    const burnAmount = BigInt(requested) >= 10000n ? requested : '10000';

    try {
      const res = await this.pool.query<{ participate_anti_inflation_burn_draw: any }>(
        `SELECT public.participate_anti_inflation_burn_draw($1, $2)`,
        [userId, burnAmount]
      );
      const result = res.rows[0]?.participate_anti_inflation_burn_draw;
      return result;
    } catch (err: any) {
      console.error('[BurnEventController] Error:', err);
      throw new BadRequestException(err?.message || '소각 드로우 참여에 실패했습니다.');
    }
  }
}
