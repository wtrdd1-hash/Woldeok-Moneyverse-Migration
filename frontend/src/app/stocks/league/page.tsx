import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, Trophy } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projectLeague } from './league-evidence';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '가상 주식 챔피언십 리그 — 서버 확인 순위',
  description: '서버에서 확인한 현재 가상 주식 리그 순위만 표시합니다. 카피 트레이딩 거래 기능은 검증 전까지 제공하지 않습니다.',
  robots: { index: false, follow: false },
};

export default async function StocksLeaguePage() {
  let result: unknown = null;
  try {
    result = await api<unknown>('/api/v1/stocks/league/current');
  } catch {
    // A failed read must never turn into a fabricated leaderboard or zero ROI.
  }
  const league = projectLeague(result);

  return (
    <main className="container mx-auto grid max-w-5xl min-w-0 gap-5 px-4 py-6 sm:py-10" data-page="stocks-league">
      <PageHeader eyebrow="VERIFIED LEAGUE" title="가상 주식 챔피언십 리그">
        현재 서버에 기록된 시즌과 순위만 보여줍니다. 수익률은 서버의 리그 기록이며 미래 수익이나 실제 거래 수익을 보장하지 않습니다.
      </PageHeader>
      <section aria-labelledby="league-status-title" className="min-w-0">
        <Card>
          <CardHeader>
            <CardTitle id="league-status-title" className="flex items-center gap-2 text-lg">
              <Trophy aria-hidden="true" className="size-5" /> 현재 리그 상태
            </CardTitle>
          </CardHeader>
          <CardContent>
            {league.state === 'unavailable' ? (
              <div role="status" aria-live="polite" className="flex flex-wrap items-start gap-2 text-sm">
                <AlertCircle aria-hidden="true" className="size-5 shrink-0" />
                <p>리그 기록을 확인할 수 없습니다. 실제 순위나 수익률을 추정해서 표시하지 않습니다. 잠시 후 다시 확인해 주세요.</p>
              </div>
            ) : league.state === 'empty' ? (
              <p role="status" className="text-sm text-muted-foreground">현재 서버에 등록된 진행 중인 리그가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-semibold break-words">{league.seasonTitle} · 서버 기록 참가자 {league.participants.toLocaleString('ko-KR')}명</p>
                {league.traders.length === 0 ? (
                  <p role="status" className="text-sm text-muted-foreground">현재 시즌에 확인된 순위 기록이 없습니다.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[280px] text-left text-sm">
                      <caption className="sr-only">현재 리그의 서버 확인 순위와 기록 수익률</caption>
                      <thead><tr className="border-b text-muted-foreground">
                        <th scope="col" className="py-3 pr-2">순위</th>
                        <th scope="col" className="py-3 pr-2">참가자</th>
                        <th scope="col" className="py-3 text-right">기록 수익률</th>
                      </tr></thead>
                      <tbody>{league.traders.map((trader) => (
                        <tr key={trader.id} className="border-b last:border-0">
                          <th scope="row" className="py-3 pr-2 font-semibold">{trader.rank}위</th>
                          <td className="max-w-[16rem] break-words py-3 pr-2">{trader.name}</td>
                          <td className="py-3 text-right tabular-nums">{trader.returnRate.toFixed(2)}%</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
      <aside aria-label="거래 기능 안내" className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed">
        카피 트레이딩 구독·해지 거래 기능은 서버 원장과 실제 주문 실행을 검증할 때까지 이용할 수 없습니다. 이 화면에서는 WLD를 차감하거나 거래를 생성하지 않습니다.
      </aside>
      <Link href="/stocks" className="inline-flex min-h-11 w-fit items-center rounded-lg border border-border px-4 text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        주식 화면으로 돌아가기
      </Link>
    </main>
  );
}
