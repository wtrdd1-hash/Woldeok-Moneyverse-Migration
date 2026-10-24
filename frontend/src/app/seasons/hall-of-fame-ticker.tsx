import { Trophy } from 'lucide-react';
import type { VerifiedHallSeason } from './season-data';

export function SeasonHallOfFameTicker({ seasons }: {
  readonly seasons: readonly VerifiedHallSeason[] | null;
}) {
  return (
    <section aria-labelledby="season-archive-heading" className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
      <h2 id="season-archive-heading" className="flex items-center gap-2 text-lg font-bold">
        <Trophy aria-hidden="true" className="size-5 text-amber-500" /> 시즌 명예의 전당
      </h2>
      {seasons === null ? (
        <p role="status" className="mt-3 text-sm text-muted-foreground">명예의 전당 기록을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.</p>
      ) : seasons.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">확정된 시즌 명예의 전당 기록이 없습니다.</p>
      ) : (
        <details className="mt-3 rounded-xl border border-border/60 bg-card/70 p-3">
          <summary className="flex min-h-11 cursor-pointer items-center rounded-lg px-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            명예의 전당 기록 보기 ({seasons.length}개 시즌)
          </summary>
          <div className="mt-3 space-y-5">
            {seasons.map((season) => (
              <section key={season.seasonId} aria-label={season.seasonName} className="rounded-xl border border-border/60 p-3 sm:p-4">
                <h3 className="font-bold break-words">{season.seasonName}</h3>
                <p className="text-xs text-muted-foreground">정산일: {new Date(season.settledAt).toLocaleDateString('ko-KR')}</p>
                {season.honorees.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">확정된 헌액자가 없습니다.</p>
                ) : (
                  <ol className="mt-3 space-y-2" aria-label="확정된 헌액자">
                    {season.honorees.map((honoree) => (
                      <li key={`${season.seasonId}-${honoree.rank}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/30 p-3 text-sm">
                        <span className="min-w-0 break-words font-semibold">#{honoree.rank} {honoree.displayName}</span>
                        <span className="text-muted-foreground">{honoree.score.toLocaleString('ko-KR')}점 · {honoree.trophyName}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
