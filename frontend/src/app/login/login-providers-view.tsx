import Link from 'next/link';
import { apiOrNull } from '@/lib/api';
import { submitLocalLogin } from './actions';
import { G1PageHero } from '@/components/g1/page-hero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export async function LoginProvidersView({
  error,
  notice,
}: {
  readonly error?: string | undefined;
  readonly notice?: string | undefined;
}) {
  const data = await apiOrNull<{ providers: { id: string; enabled: boolean }[] }>(
    '/api/v1/auth/providers',
  );
  const rawProviders = data?.providers ?? [
    { id: 'google', enabled: true },
    { id: 'discord', enabled: true },
  ];
  const enabled = new Set(rawProviders.filter((p) => p.enabled).map((p) => p.id));

  return (
    <div className="flex flex-col gap-4">
      <G1PageHero title="로그인" lead="길드 문을 열고 모험을 이어가세요. 디스코드, 구글 또는 자체 계정으로 들어올 수 있습니다." scene="gate" />

      {notice && (
        <p role="status" className="g1-panel text-sm text-[var(--g1-ink)]">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="g1-panel border-[var(--g1-ember)] text-sm text-[var(--g1-ink)]">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section aria-labelledby="local-login-heading" className="g1-panel flex flex-col gap-4">
          <h2 id="local-login-heading" className="text-lg text-[var(--g1-ink)]">자체 계정</h2>
          <form action={submitLocalLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="auth-email">이메일 주소</Label>
              <Input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={254}
                placeholder="name@example.com"
                required
                className="min-h-11"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auth-password">비밀번호</Label>
                <Link href="/forgot-password" prefetch={false} className="text-xs text-[var(--g1-gold)] hover:underline">
                  비밀번호 찾기
                </Link>
              </div>
              <Input
                id="auth-password"
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={128}
                placeholder="비밀번호 입력"
                required
                className="min-h-11"
              />
            </div>
            <Button type="submit" className="min-h-11 w-full sm:w-fit">
              자체 계정으로 로그인
            </Button>
          </form>
          <p className="text-sm text-[var(--g1-muted)]">
            처음이신가요?{' '}
            <Link href="/register" prefetch={false} className="text-[var(--g1-gold)] hover:underline">
              회원가입
            </Link>
          </p>
        </section>

        <section aria-labelledby="social-login-heading" className="g1-panel flex flex-col gap-4">
          <h2 id="social-login-heading" className="text-lg text-[var(--g1-ink)]">간편 로그인</h2>
          <div className="flex flex-col gap-2">
            {enabled.has('discord') && (
              <a
                href="/auth/discord/authorize"
                className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--g1-discord)] px-4 text-sm font-semibold text-[var(--g1-ink)] transition-transform duration-150 active:scale-[0.97]"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                디스코드로 계속하기
              </a>
            )}
            {enabled.has('google') && (
              <a
                href="/auth/google/authorize"
                className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--g1-line)] bg-[var(--g1-night)] px-4 text-sm font-semibold text-[var(--g1-ink)] transition-transform duration-150 hover:border-[var(--g1-gold)] active:scale-[0.97]"
              >
                구글로 계속하기
              </a>
            )}
            {!enabled.has('discord') && !enabled.has('google') && (
              <p className="text-sm text-[var(--g1-muted)]">지금은 간편 로그인을 사용할 수 없습니다. 자체 계정으로 로그인해 주세요.</p>
            )}
          </div>
          <p className="text-xs leading-relaxed text-[var(--g1-muted)]">
            계정 진입 시{' '}
            <Link href="/terms" prefetch={false} className="text-[var(--g1-gold)] underline">
              이용약관
            </Link>{' '}
            및{' '}
            <Link href="/privacy" prefetch={false} className="text-[var(--g1-gold)] underline">
              개인정보처리방침
            </Link>
            에 동의한 것으로 처리됩니다.
          </p>
        </section>
      </div>
    </div>
  );
}
