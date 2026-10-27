import Link from 'next/link';
import type { ActionState } from '@/lib/action-state';

/** Reuse the existing account reauthentication flow; never ask for credentials in an admin mutation dialog. */
export function MarketEventReauthHelp({ state }: { readonly state: ActionState }) {
  return (
    <div className="grid gap-2 rounded-lg border border-border/80 bg-muted/40 p-3 text-sm">
      {state.reauthenticationRequired ? (
        <p role="alert" className="font-medium text-destructive">
          최근 본인 확인이 만료되어 소식을 변경하지 않았습니다. 본인 확인 후 이 화면으로 돌아와 다시 제출해 주세요.
        </p>
      ) : (
        <p className="text-muted-foreground">
          시장 소식 변경에는 최근 본인 확인이 필요합니다. 본인 확인 후 이 화면으로 돌아와 다시 제출해 주세요.
        </p>
      )}
      <Link
        href="/account/security#reauthentication"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-center font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-fit"
      >
        계정 보안에서 본인 확인
      </Link>
    </div>
  );
}
