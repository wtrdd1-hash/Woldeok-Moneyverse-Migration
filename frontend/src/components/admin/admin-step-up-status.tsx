'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { TranslatedText as T } from '@/components/translated-text';

interface StepUpState { readonly fresh: boolean; readonly freshUntil: string | null }

/**
 * The server's step-up state for this session (owner decision v2026.11.27.1457.1): fresh while the
 * session's password re-verification is under 15 minutes old. It replaces a Telegram/Discord
 * "2FA elevation" countdown that no server authorisation consulted. Unreadable means not fresh.
 */
export function AdminStepUpStatus() {
  const [state, setState] = useState<StepUpState | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/admin/auth/step-up/status', { cache: 'no-store' });
        const data = res.ok ? ((await res.json()) as Partial<StepUpState>) : null;
        const until = typeof data?.freshUntil === 'string' ? Date.parse(data.freshUntil) : NaN;
        const fresh = data?.fresh === true && Number.isFinite(until) && until > Date.now();
        if (!cancelled) setState({ fresh, freshUntil: fresh ? (data?.freshUntil ?? null) : null });
      } catch {
        if (!cancelled) setState({ fresh: false, freshUntil: null });
      }
    };
    void load();
    const timer = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  if (state?.fresh && state.freshUntil) {
    const minutes = Math.max(0, Math.ceil((Date.parse(state.freshUntil) - Date.now()) / 60_000));
    return (
      <span data-testid="step-up-fresh" className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-[var(--g1-line)] px-2.5 text-[11px] font-semibold text-[var(--g1-ink)]">
        <ShieldCheck className="size-3.5 shrink-0 text-[var(--g1-mint)]" aria-hidden="true" />
        <T korean={`본인 확인됨 · ${minutes}분 남음`} english={`Re-verified · ${minutes} min left`} japanese={`本人確認済み · 残り${minutes}分`} chinese={`已确认身份 · 剩余${minutes}分钟`} vietnamese={`Đã xác minh · còn ${minutes} phút`} />
      </span>
    );
  }

  return (
    <a
      href="/account/security"
      target="_blank"
      rel="noopener"
      className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-[var(--g1-line)] px-2.5 text-[11px] font-semibold text-[var(--g1-violet)] hover:bg-[var(--g1-plum-2)]"
    >
      <ShieldAlert className="size-3.5 shrink-0" aria-hidden="true" />
      <T korean="고위험 작업 전 본인 확인" english="Re-verify before high-risk actions" japanese="高リスク操作の前に本人確認" chinese="高风险操作前确认身份" vietnamese="Xác minh lại trước thao tác rủi ro cao" />
    </a>
  );
}
