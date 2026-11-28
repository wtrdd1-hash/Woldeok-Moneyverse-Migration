'use client';

import { ShieldCheck } from 'lucide-react';
import { Field, FieldDescription } from '@/components/ui/field';
import { TranslatedText as T } from '@/components/translated-text';

/**
 * Step-up notice for a high-risk administrator form.
 * (Step-up re-authentication of the password, not an independent second factor.)
 *
 * Owner decision v2026.11.27.1457.1: the server refuses every administrator write unless the
 * current session re-verified its password within 15 minutes (AdminApiBoundaryFilter, migration
 * 031). This used to render a Telegram/Discord OTP request and a code field that no server check
 * ever read, which suggested a protection that did not exist; the independent authenticator stays
 * retired (migration 197). The notice states the real rule and links to where it is satisfied,
 * in a new tab so the unsent form survives.
 */
export function StepUpField({ id, undo }: { readonly id: string; readonly undo: string }) {
  return (
    <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3.5" data-step-up={id}>
      <p className="flex items-start gap-1.5 text-xs font-semibold text-foreground">
        <ShieldCheck className="mt-px size-3.5 shrink-0 text-primary" aria-hidden="true" />
        <T
          korean="이 작업은 최근 15분 안에 비밀번호로 본인 확인을 마친 세션에서만 실행됩니다."
          english="This action runs only from a session that re-verified its password in the last 15 minutes."
          japanese="この操作は、直近15分以内にパスワードで本人確認を済ませたセッションでのみ実行されます。"
          chinese="此操作仅能在最近15分钟内通过密码完成身份确认的会话中执行。"
          vietnamese="Thao tác này chỉ chạy từ phiên đã xác minh lại mật khẩu trong 15 phút gần nhất."
        />
      </p>
      <a href="/account/security" target="_blank" rel="noopener" className="inline-flex min-h-11 items-center text-xs font-semibold text-primary underline">
        <T korean="계정 보안에서 본인 확인하기" english="Re-verify in account security" japanese="アカウントセキュリティで本人確認する" chinese="前往账户安全进行身份确认" vietnamese="Xác minh lại trong bảo mật tài khoản" />
      </a>
      <Field>
        <FieldDescription className="text-[11px] text-muted-foreground/80">
          <T korean="변경 전 영향과 복구 방법을 확인하세요. 되돌리기: " english="Check the impact and the way back before changing. Undo: " japanese="変更前に影響と復旧方法を確認してください。元に戻す: " chinese="变更前请确认影响与恢复方法。撤销：" vietnamese="Kiểm tra ảnh hưởng và cách khôi phục trước khi thay đổi. Hoàn tác: " />
          {undo}
        </FieldDescription>
      </Field>
    </div>
  );
}
