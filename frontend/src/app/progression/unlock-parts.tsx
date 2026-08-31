import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import type { EarlyUnlock } from './unlocks';
import { UNLOCK_STATE_LABELS, nextUnlock, unlockConditions, unlockState, unlockStateNote } from './unlocks';

/**
 * The early-game unlock ladder.
 *
 * A server component with no state, kept out of `page.tsx` for the reason
 * `stages.ts` is: a page cannot be rendered in a test, and the part most
 * likely to be got wrong here is which of three words a rung is given.
 */
export function UnlockLadder({ unlocks }: { readonly unlocks: readonly EarlyUnlock[] }) {
  if (unlocks.length === 0) {
    return (
      <EmptyState
        title="해금 목록을 불러오지 못했어요."
        description="열린 것과 잠긴 것을 추측해서 보여 주지는 않습니다. 잠시 후 다시 확인해 주세요."
      />
    );
  }

  const next = nextUnlock(unlocks);

  return (
    <div className="grid gap-3">
      {/* 16.0 asks for one next unlock, always visible. It is the next thing
          that is actually refused -- a rung nothing enforces is available
          today, and pointing a member at it would send them to work for
          something they already have. */}
      <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
        {next === null
          ? '지금 잠겨 있는 콘텐츠가 없어요. 아래 목록에서 앞으로 열릴 것들을 미리 볼 수 있어요.'
          : `다음으로 열리는 것은 ${next.unlock_label}이에요.`}
      </p>

      <ol className="grid gap-2">
        {unlocks.map((unlock) => {
          const state = unlockState(unlock);
          const conditions = unlockConditions(unlock);
          return (
            <li
              key={unlock.unlock_code}
              aria-current={unlock.next_up ? 'step' : undefined}
              className={`grid gap-2 rounded-[14px] border p-4 ${
                state === 'unlocked'
                  ? 'border-forest-soft bg-mint'
                  : state === 'locked'
                    ? 'bg-surface'
                    : 'border-dashed text-muted-foreground'
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{unlock.unlock_label}</span>
                <Badge variant={state === 'unlocked' ? 'default' : 'secondary'}>
                  {UNLOCK_STATE_LABELS[state]}
                </Badge>
              </div>

              <p className="text-sm">{unlock.unlock_detail}</p>

              {conditions.length > 0 && (
                <dl className="grid gap-1 text-sm">
                  {conditions.map((condition) => (
                    <div key={condition.key} className="flex items-baseline justify-between gap-3">
                      <dt className="text-muted-foreground">{condition.label}</dt>
                      <dd className={`tabular ${condition.met ? 'text-forest-soft' : ''}`}>
                        {condition.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              <p className="text-xs text-muted-foreground">{unlockStateNote(unlock)}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** The card the ladder sits in, so the page keeps one shape for its sections. */
export function UnlockCard({ unlocks }: { readonly unlocks: readonly EarlyUnlock[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>초반 해금</CardTitle>
        <CardDescription>
          직업 레벨과 가입 기간, 보상을 받은 작업 수로 정해집니다. 여기 적힌 숫자는 모두 실제 기록에서
          계산한 값이에요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UnlockLadder unlocks={unlocks} />
      </CardContent>
    </Card>
  );
}
