import { ShieldAlert, Trophy } from 'lucide-react';

/** A live event leaderboard is not evidence of historic season award recipients. */
export function SeasonHallOfFameTicker() {
  return (
    <section aria-labelledby="season-hall-source-title" className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h2 id="season-hall-source-title" className="flex items-center gap-2 text-base font-bold">
        <Trophy className="size-5 text-amber-600" aria-hidden="true" />
        시즌 명예의 전당
      </h2>
      <p role="status" className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        역대 헌액자와 기여 금액의 서버 기록이 검증되지 않아 명단을 공개하지 않습니다.
        현재 이벤트 순위는 아래의 실제 서버 순위표에서 확인할 수 있습니다.
      </p>
    </section>
  );
}
