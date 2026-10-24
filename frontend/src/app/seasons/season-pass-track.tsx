import { Award, Lock, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { VerifiedCurrentSeason } from './season-data';

// These are proposed presentation milestones, not database entitlements.
const ROADMAP = [
  { level: 1, title: '시즌 개척자 표식' },
  { level: 5, title: '시즌 입문 지원' },
  { level: 10, title: '기념 장식' },
  { level: 20, title: '시즌 전용 토큰' },
  { level: 30, title: '사업체 테마' },
  { level: 40, title: '시즌 칭호' },
  { level: 50, title: '시즌 완료 트로피' },
] as const;

export function SeasonPassTrack({ currentSeason }: {
  readonly currentSeason: VerifiedCurrentSeason | null;
}) {
  return (
    <section aria-labelledby="season-pass-heading" className="space-y-4">
      <Card className="rounded-2xl border-primary/30">
        <CardHeader>
          <CardTitle id="season-pass-heading" className="flex flex-wrap items-center gap-2 text-xl">
            <Award aria-hidden="true" className="size-5 text-primary" /> 시즌 진행 및 보상 안내
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentSeason ? (
            <div className="grid gap-3 sm:grid-cols-3" aria-label="서버에서 확인한 내 시즌 기록">
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">현재 시즌</p>
                <p className="font-semibold break-words">{currentSeason.seasonName}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">확인된 시즌 점수</p>
                <p className="font-semibold">{currentSeason.myScore.toLocaleString('ko-KR')}점</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">현재 순위 / 등급</p>
                <p className="font-semibold">{currentSeason.myRank === null ? '순위 없음' : `${currentSeason.myRank}위`} · {currentSeason.myTier}</p>
              </div>
            </div>
          ) : (
            <p role="status" className="text-sm text-muted-foreground">
              시즌 진행 정보를 확인할 수 없습니다. 나중에 다시 확인해 주세요.
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            시즌 점수는 서버에서 확인된 기록이며, 별도의 XP·50레벨 달성 또는 개별 마일스톤 지급을 의미하지 않습니다.
            실제 정산 보상은 시즌 종료 후 서버 영수증으로 확인합니다.
          </p>
        </CardContent>
      </Card>
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 space-y-3">
        <h3 className="flex items-center gap-2 font-bold"><Lock aria-hidden="true" className="size-4" /> 마일스톤 로드맵 미리보기</h3>
        <p className="text-sm text-muted-foreground">
          마일스톤 보상은 현재 미리보기이며 지급·수령 기능이 제공되지 않습니다. 아래 단계는 확정된 회원 보유 기록이 아닙니다.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="미구현 보상 로드맵">
          {ROADMAP.map((item) => (
            <li key={item.level} className="flex min-w-0 items-center gap-2 rounded-xl border border-border/60 bg-card/70 p-3 text-sm">
              <Trophy aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              <span className="break-words">예시 Lv.{item.level} · {item.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
