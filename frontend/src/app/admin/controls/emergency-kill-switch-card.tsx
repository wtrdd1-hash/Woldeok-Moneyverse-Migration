import { ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FeatureSwitch } from '../types';
import { SwitchStateBadge } from './controls-forms';

/**
 * This is evidence of real backend feature switches, NOT a circuit breaker.
 * Stock-market, treasury, sign-up and bot emergency freezes have no verified
 * dedicated mutation contract here. Never simulate their state or audit trail.
 */
export function EmergencyKillSwitchCard({
  featureSwitches,
}: {
  readonly featureSwitches: readonly FeatureSwitch[] | null;
}) {
  return (
    <Card className="border-rose-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert aria-hidden="true" className="size-5 text-rose-500" />
          비상 제어 상태 확인
        </CardTitle>
        <CardDescription>
          전용 주식·국고·가입·봇 긴급 동결은 이 화면에서 실행할 수 없습니다.
          실제 서버의 기능 스위치만 확인할 수 있으며, 기능 스위치가 모든 진행 중인 거래를 동결하는 것은 아닙니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {featureSwitches === null ? (
          <p role="alert" className="text-sm text-destructive">
            서버의 기능 스위치 상태를 확인할 수 없습니다. 안전하거나 정상 가동 중이라고 판단하지 마세요.
          </p>
        ) : featureSwitches.length === 0 ? (
          <p role="status" className="text-sm text-muted-foreground">
            서버에서 확인된 기능 스위치가 없습니다. 비상 동결 상태는 알 수 없습니다.
          </p>
        ) : (
          <ul aria-label="서버에서 검증된 기능 스위치" className="grid gap-2 sm:grid-cols-2">
            {featureSwitches.map((feature) => (
              <li key={feature.feature_key} className="flex min-w-0 items-center justify-between gap-3 rounded-md border p-3 text-sm">
                <span className="min-w-0 break-words">{feature.title}</span>
                <SwitchStateBadge state={feature.state} />
              </li>
            ))}
          </ul>
        )}
        <a href="#feature-switches" className="inline-flex min-h-11 w-fit items-center rounded-md border px-4 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
          실제 기능 스위치로 이동
        </a>
      </CardContent>
    </Card>
  );
}
