import Link from 'next/link';
import type { VerifiedLeague } from './league-source';

interface Props {
  readonly league: VerifiedLeague | null;
  readonly isEn: boolean;
}

/** Server-rendered read-only league. Never manufacture financial state or subscriptions. */
export function StocksLeagueClient({ league, isEn }: Props) {
  return (
    <section className="grid gap-4" aria-label={isEn ? 'League source status' : '리그 원천 상태'}>
      <div role="status" aria-live="polite" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-7">
        {isEn
          ? 'Automatic copying, budget allocation, trade executions and performance-fee settlement are disabled until ledger-backed evidence is available.'
          : '원장 기반 검증 전까지 자동 추종, 자본금 배정, 복사 체결 및 성과 수수료 정산은 중단됩니다.'}
      </div>
      {league === null ? (
        <div role="alert" className="rounded-xl border p-5">
          <p>{isEn ? 'League records could not be verified.' : '리그 데이터를 검증할 수 없습니다.'}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {isEn ? 'This is not a confirmed empty leaderboard.' : '리그 참가자가 0명이라는 의미는 아닙니다.'}
          </p>
        </div>
      ) : league.season === null ? (
        <div role="status" className="rounded-xl border p-5">
          {isEn ? 'No active league season is currently recorded.' : '서버에 등록된 진행 중인 리그 시즌이 없습니다.'}
        </div>
      ) : (
        <div className="grid gap-3">
          <h2 className="text-lg font-semibold break-words">{league.season.title}</h2>
          <p className="text-sm text-muted-foreground">
            {isEn ? 'Server-reported participants' : '서버 집계 참가자'}: {league.season.totalParticipants.toLocaleString()}
          </p>
          {league.leaderboard.length === 0 ? (
            <p role="status" className="rounded-xl border p-5">
              {isEn ? 'No ranked participants in this season.' : '이번 시즌의 집계된 순위가 없습니다.'}
            </p>
          ) : (
            <ol aria-label={isEn ? 'Server-reported rankings' : '서버 집계 순위'} className="grid gap-3">
              {league.leaderboard.map((entry) => (
                <li key={entry.id} className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                  <div className="min-w-0">
                    <span className="mr-3 font-bold">{entry.rankPosition}.</span>
                    <span className="break-all font-medium">{entry.userName}</span>
                    <p className="mt-1 text-xs text-muted-foreground">{entry.tier}</p>
                  </div>
                  <div className="text-right text-sm">
                    <span className="font-mono">{entry.roiRate.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%</span>
                    <p className="text-xs text-muted-foreground">
                      {isEn ? 'Server-calculated return, not a settlement receipt' : '서버 계산 수익률 · 정산 영수증 아님'}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
      <nav aria-label={isEn ? 'League navigation' : '리그 이동'} className="flex flex-wrap gap-3">
        <Link href="/stocks/league" className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2">
          {isEn ? 'Check again' : '다시 확인'}
        </Link>
        <Link href="/stocks" className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2">
          {isEn ? 'Stock market' : '주식 거래소'}
        </Link>
      </nav>
    </section>
  );
}
