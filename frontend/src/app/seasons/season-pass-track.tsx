import { Gift, LockKeyhole } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/** No season-pass XP, milestones or claim receipts are certified by the current API. */
export function SeasonPassTrack() {
  return (
    <section aria-labelledby="season-pass-source-title">
      <Card className="rounded-2xl border-amber-500/30 bg-card">
        <CardHeader className="gap-2">
          <CardTitle id="season-pass-source-title" className="flex flex-wrap items-center gap-2 text-lg sm:text-xl">
            <Gift className="size-5 text-amber-600" aria-hidden="true" />
            시즌 패스 보상 확인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-relaxed">
            <LockKeyhole className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
            <p>
              시즌 패스 XP·마일스톤·수령 기록은 서버와 금융 원장에서 검증할 수 없어 현재 표시하거나 수령할 수 없습니다.
              기존 이벤트 참가와 실제 순위는 아래의 서버 조회 결과에서 확인해 주세요.
              이 안내는 보상을 받았거나 보상이 없다는 뜻이 아닙니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
