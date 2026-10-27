'use client';

import Link from 'next/link';
import type { ActionState } from '@/lib/action-state';

/** A denied economic operation must offer recovery without bypassing the guard. */
export function MarketEventReauthenticationHelp({ state }: { readonly state: ActionState }) {
  if (state.status !== 'error' || state.errorCode !== 'reauthentication_required') return null;

  return (
    <div role="note" className="grid gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
      <p>
        관리자 OTP 인증은 폐지되었습니다. 이 가격 영향 작업에는 최근 15분 이내의 본인 확인이 필요합니다.
        계정 보안에서 연결된 로그인 수단으로 본인 확인을 마친 후 이 화면으로 돌아와 다시 실행하세요.
      </p>
      <Link
        href="/account/security"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 w-fit items-center rounded-md border border-current px-3 py-2 font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        계정 보안에서 본인 확인 (새 탭)
      </Link>
    </div>
  );
}
