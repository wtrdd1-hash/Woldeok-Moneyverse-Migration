import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
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
    const statsRes = await this.pool.query<{
      total_burned: string;
      total_participants: string;
    }>(`
      SELECT 
        COALESCE(SUM(burn_amount), 0)::text as total_burned,
        COUNT(*)::text as total_participants
      FROM public.burn_event_participations
    `).catch(() => ({ rows: [{ total_burned: '0', total_participants: '0' }] }));

    const recentRes = await this.pool.query<{
      display_name: string;
      reward_title: string;
      burn_amount: string;
      created_at: string;
    }>(`
      SELECT 
        COALESCE(mp.display_name, '익명의 시민') as display_name,
        b.reward_title,
        b.burn_amount::text as burn_amount,
        b.created_at
      FROM public.burn_event_participations b
      LEFT JOIN public.member_profiles mp ON mp.user_id = b.user_id
      ORDER BY b.created_at DESC
      LIMIT 10
    `).catch(() => ({ rows: [] }));

    return {
      success: true,
      totalBurnedWld: statsRes.rows[0]?.total_burned || '0',
      totalParticipants: Number(statsRes.rows[0]?.total_participants || 0),
      recentWinners: recentRes.rows.map((r) => ({
        displayName: r.display_name,
        rewardTitle: r.reward_title,
        burnAmount: Number(r.burn_amount),
        createdAt: r.created_at,
      })),
    };
  }

  @Post('participate')
  @ApiOperation({ summary: '10,000 WLD 국고 영구 소각 및 한정판 칭호 드로우 참여' })
  async participateBurnDraw(@Req() req: RequestWithSession, @Body() body: { burnAmount?: number }) {
    const userId = req.session?.user_id;
    if (!userId) {
      throw new BadRequestException('로그인이 필요한 서비스입니다.');
    }

    const burnAmount = body.burnAmount && body.burnAmount >= 10000 ? body.burnAmount : 10000;

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
