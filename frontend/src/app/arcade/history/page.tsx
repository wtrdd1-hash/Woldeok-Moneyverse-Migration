import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment, groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '내 아케이드 게임 기록 및 최근 순손익',
  robots: { index: false, follow: false },
};

interface CasinoPlay {
  readonly play_id: string;
  readonly transaction_id: string;
  readonly game: string;
  readonly choice: string;
  readonly outcome: string;
  readonly stake_amount: string;
  readonly net_amount: string;
  readonly played_at: string;
}

interface CasinoHistorySummary {
  readonly scope: 'last_20_recorded_plays';
  readonly sampleLimit: 20;
  readonly playCount: number;
  readonly totalStakeWld: string;
  readonly netWld: string;
  readonly winCount: number;
  readonly lossCount: number;
  readonly evenCount: number;
  readonly plays: readonly CasinoPlay[];
}

function isSummary(value: CasinoHistorySummary | null): value is CasinoHistorySummary {
  return value !== null && value.scope === 'last_20_recorded_plays' &&
    value.sampleLimit === 20 && Number.isInteger(value.playCount) &&
    value.playCount >= 0 && value.playCount <= 20 &&
    Array.isArray(value.plays) && value.plays.length === value.playCount &&
    /^(0|[1-9][0-9]*)$/.test(value.totalStakeWld) &&
    /^(0|-?[1-9][0-9]*)$/.test(value.netWld) &&
    [value.winCount, value.lossCount, value.evenCount].every((n) => Number.isInteger(n) && n >= 0) &&
    value.winCount + value.lossCount + value.evenCount === value.playCount &&
    value.plays.every((p) => typeof p.play_id === 'string' &&
      typeof p.transaction_id === 'string' &&
      /^(0|[1-9][0-9]*)$/.test(p.stake_amount) &&
      /^(0|-?[1-9][0-9]*)$/.test(p.net_amount));
}

export default async function CasinoHistorySummaryPage() {
  await requireMember();
  const response = await apiOrNull<CasinoHistorySummary>('/api/v1/casino/history/summary');
  const summary = isSummary(response) ? response : null;

  return (
    <main data-page="casino-history" className="mv-page mv-page--gameplay grid gap-5">
      <Button asChild variant="ghost" className="-ml-3 w-fit">
        <Link href="/arcade"><ArrowLeft className="size-4" />아케이드로 돌아가기</Link>
      </Button>
      <PageHeader eyebrow="VERIFIED PLAY HISTORY" title="내 아케이드 게임 기록">
        최근 최대 20판 기준으로 서버에 기록된 게임의 도전 금액과 순손익을 보여줍니다.
        전체 기간 통계가 아닙니다. WLD는 서비스 내 가상 재화입니다.
      </PageHeader>
      {!summary ? (
        <EmptyState title="게임 기록을 불러올 수 없어요." description="서버 기록을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요." />
      ) : summary.playCount === 0 ? (
        <EmptyState title="기록된 게임이 없어요." description="현재 확인 가능한 최근 게임 기록이 없습니다." />
      ) : (
        <>
          <Card><CardContent className="grid gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-sm text-muted-foreground">확인된 게임</p><p className="font-bold tabular-nums">{summary.playCount}판</p></div>
            <div><p className="text-sm text-muted-foreground">도전 금액 합계</p><p className="font-bold tabular-nums break-all">{groupDigits(summary.totalStakeWld)} WLD</p></div>
            <div><p className="text-sm text-muted-foreground">순손익</p><p className="font-bold tabular-nums break-all">{groupDigits(summary.netWld)} WLD</p></div>
            <div><p className="text-sm text-muted-foreground">승 / 패 / 무</p><p className="font-bold tabular-nums">{summary.winCount} / {summary.lossCount} / {summary.evenCount}</p></div>
          </CardContent></Card>
          <Card><CardContent className="overflow-x-auto pt-6">
            <table className="w-full text-sm">
              <caption className="mb-3 text-left text-muted-foreground">실제 원장 거래 ID가 연결된 최근 게임 결과</caption>
              <thead><tr className="border-b text-left"><th scope="col" className="p-2">시각</th><th scope="col" className="p-2">게임</th><th scope="col" className="p-2 text-right">도전 WLD</th><th scope="col" className="p-2 text-right">순손익 WLD</th><th scope="col" className="p-2">원장 거래 ID</th></tr></thead>
              <tbody>{summary.plays.map((play) => (
                <tr key={play.play_id} className="border-b">
                  <td className="p-2 whitespace-nowrap">{formatMoment(play.played_at, '시각 확인 불가')}</td>
                  <td className="p-2">{play.game}</td>
                  <td className="p-2 text-right tabular-nums">{groupDigits(play.stake_amount)}</td>
                  <td className="p-2 text-right tabular-nums">{groupDigits(play.net_amount)}</td>
                  <td className="p-2 font-mono text-xs break-all">{play.transaction_id}</td>
                </tr>
              ))}</tbody>
            </table>
          </CardContent></Card>
        </>
      )}
    </main>
  );
}
