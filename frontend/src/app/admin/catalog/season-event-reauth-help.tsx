'use client';

import Link from 'next/link';
import type { ActionState } from '@/lib/action-state';

/** Recover from the server's recent-auth denial without weakening the mutation guard. */
export function SeasonEventReauthenticationHelp({ state }: { readonly state: ActionState }) {
  if (state.status !== 'error' || state.errorCode !== 'reauthentication_required') return null;

  return (
    <div role="note" className="grid gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
      <p>
        시즌 이벤트 등록·변경은 최근 15분 이내의 본인 확인이 필요합니다.
        계정 보안에서 연결된 로그인 수단으로 본인 확인을 마친 뒤 이 화면으로 돌아와 다시 실행하세요.
        관리자 OTP 코드를 새로 입력할 필요는 없습니다.
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
