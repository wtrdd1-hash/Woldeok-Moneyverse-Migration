'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Copy, Share2, Users } from 'lucide-react';

type ShareStatus = 'idle' | 'copied' | 'failed';

/**
 * A service-sharing card, not a referral-reward program. The backend has no
 * invite-code validation or ledger-backed referral payout contract.
 */
export function ReferralSystem() {
  const [status, setStatus] = useState<ShareStatus>('idle');
  const signupUrl = typeof window === 'undefined'
    ? 'https://easy-scraping.com/register'
    : `${window.location.origin}/register`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(signupUrl);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  };

  const shareLink = async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: '월덕 머니버스 서비스 소개',
        text: '월덕 머니버스에서 게임 속 가상 경제를 체험해 보세요.',
        url: signupUrl,
      });
      setStatus('idle');
    } catch (error) {
      // Closing the native share sheet is not a failed reward or signup.
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setStatus('failed');
      }
    }
  };

  return (
    <section aria-labelledby="service-share-title" className="grid gap-5 rounded-3xl border border-amber-500/30 bg-zinc-950 p-5 text-white sm:p-8">
      <div className="grid gap-2">
        <span className="flex items-center gap-2 text-xs font-semibold text-amber-300"><Users aria-hidden="true" className="size-4" />서비스 소개</span>
        <h2 id="service-share-title" className="text-xl font-bold sm:text-2xl">친구에게 월덕 머니버스 소개하기</h2>
        <p className="text-sm leading-6 text-zinc-300">가상 주식, 은행, 직업 활동을 함께 체험할 수 있도록 공식 가입 페이지를 공유해 보세요.</p>
        <p className="text-xs leading-5 text-amber-200">현재 초대 코드 인증 및 초대 보상 지급 기능은 제공되지 않습니다. 공유만으로 WLD가 지급되지 않습니다.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label className="grid min-w-0 gap-1 text-xs text-zinc-300">
          공유할 가입 주소
          <input aria-label="공유할 공식 가입 주소" readOnly value={signupUrl} onFocus={(event) => event.currentTarget.select()} className="min-h-11 w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-white" />
        </label>
        <button type="button" onClick={copyLink} className="flex min-h-11 items-center justify-center gap-2 self-end rounded-lg border border-zinc-600 px-4 text-sm font-semibold hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
          {status === 'copied' ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
          링크 복사
        </button>
        <button type="button" onClick={shareLink} className="flex min-h-11 items-center justify-center gap-2 self-end rounded-lg bg-amber-500 px-4 text-sm font-bold text-zinc-950 hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          <Share2 aria-hidden="true" className="size-4" />서비스 공유
        </button>
      </div>
      <p aria-live="polite" role="status" className="text-sm text-zinc-200">
        {status === 'copied' ? '가입 주소를 복사했습니다.' : status === 'failed' ? '공유 또는 복사에 실패했습니다. 주소를 직접 선택해 복사해 주세요.' : ''}
      </p>
      <Link href="/register" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg text-sm font-semibold text-amber-300 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
        직접 가입 화면으로 이동 <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  );
}
