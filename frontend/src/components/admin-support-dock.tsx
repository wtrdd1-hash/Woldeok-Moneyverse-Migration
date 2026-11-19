'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Headphones, MessageCircleQuestion, ShieldAlert, X } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';

/**
 * Read-only admin help dock until Spring chat/support actors are bound to
 * authenticated server sessions. Never import the member chat transport here.
 */
export function AdminSupportDock() {
  const { locale } = useLocale();
  const isKo = locale === 'ko';
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();
    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [open]);

  return (
    <div
      data-admin-support-dock
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-3.5 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
    >
      {open && (
        <section
          id="admin-safe-support-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="admin-safe-support-title"
          className="w-[min(23rem,calc(100vw-1.75rem))] max-h-[calc(100dvh-11rem)] overflow-y-auto rounded-2xl border border-violet-400/50 bg-slate-950/95 p-4 text-slate-100 shadow-[0_20px_60px_-15px_rgba(30,15,85,0.8)] backdrop-blur-xl"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-violet-300">
                WOLDEOK ADMIN
              </p>
              <h2 id="admin-safe-support-title" className="mt-1 text-base font-extrabold text-slate-100">
                {isKo ? '관리자 도움 및 문의' : 'Admin help & support'}
              </h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label={isKo ? '관리자 문의창 닫기' : 'Close admin help'}
              className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-600 bg-slate-800 text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div role="status" className="mb-4 flex gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs leading-relaxed text-amber-100">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>
              {isKo
                ? '보안 검증 전 관리자 메시지 전송은 현재 비활성입니다. 이 창은 문의 페이지 바로가기만 제공합니다.'
                : 'Admin message sending is disabled pending security verification. This panel only provides safe help links.'}
            </p>
          </div>
          <nav className="grid gap-2" aria-label={isKo ? '관리자 문의 바로가기' : 'Admin support links'}>
            <Link href="/admin/support" onClick={() => setOpen(false)}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-400/15 px-3 py-2 text-sm font-semibold text-violet-100 focus-visible:outline-2 focus-visible:outline-cyan-300">
              <Headphones aria-hidden="true" className="size-4 shrink-0" />
              {isKo ? '관리자 고객지원' : 'Admin support queue'}
            </Link>
            <Link href="/help" onClick={() => setOpen(false)}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/75 px-3 py-2 text-sm text-slate-100 focus-visible:outline-2 focus-visible:outline-cyan-300">
              <MessageCircleQuestion aria-hidden="true" className="size-4 shrink-0" />
              {isKo ? '도움말' : 'Help center'}
            </Link>
            <Link href="/support" onClick={() => setOpen(false)}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/75 px-3 py-2 text-sm text-slate-100 focus-visible:outline-2 focus-visible:outline-cyan-300">
              <Headphones aria-hidden="true" className="size-4 shrink-0" />
              {isKo ? '일반 고객센터' : 'Member support center'}
            </Link>
          </nav>
        </section>
      )}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => open ? close() : setOpen(true)}
        aria-controls="admin-safe-support-panel"
        aria-expanded={open}
        aria-label={isKo ? '관리자 문의/지원 열기' : 'Open admin help'}
        className="flex size-14 items-center justify-center rounded-full border-2 border-violet-200 bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-700 text-white shadow-[0_8px_30px_rgba(112,65,220,0.45)] ring-4 ring-violet-400/15 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transition-none"
      >
        {open ? <X aria-hidden="true" className="size-6" /> : <MessageCircleQuestion aria-hidden="true" className="size-6" />}
      </button>
    </div>
  );
}
