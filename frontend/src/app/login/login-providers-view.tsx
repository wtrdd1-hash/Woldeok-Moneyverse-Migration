import Link from 'next/link';
import { apiOrNull } from '@/lib/api';
import { submitLocalLogin } from './actions';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { pick } from '@/lib/copy';
import { getServerLocale } from '@/lib/locale-server';
import { COPY } from './copy';

export async function LoginProvidersView({
  error,
  notice,
}: {
  readonly error?: string | undefined;
  readonly notice?: string | undefined;
}) {
  const locale = await getServerLocale();
  const t = (key: keyof typeof COPY) => pick(locale, COPY[key]);
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
      <PageHeader title={t('title')}>{t('lead')}</PageHeader>

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
          <h2 id="local-login-heading" className="text-lg text-[var(--g1-ink)]">{t('localHeading')}</h2>
          <form action={submitLocalLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="auth-email">{t('email')}</Label>
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
                <Label htmlFor="auth-password">{t('password')}</Label>
                <Link href="/forgot-password" prefetch={false} className="text-xs text-[var(--g1-gold)] hover:underline">
                  {t('forgot')}
                </Link>
              </div>
              <Input
                id="auth-password"
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={128}
                placeholder={t('passwordPlaceholder')}
                required
                className="min-h-11"
              />
            </div>
            <Button type="submit" className="min-h-11 w-full sm:w-fit">
              {t('localSubmit')}
            </Button>
          </form>
          <p className="text-sm text-[var(--g1-muted)]">
            {t('newHere')}{' '}
            <Link href="/register" prefetch={false} className="inline-flex min-h-11 items-center font-semibold text-[var(--g1-violet)] underline underline-offset-4">
              {t('register')}
            </Link>
          </p>
        </section>

        <section aria-labelledby="social-login-heading" className="g1-panel flex flex-col gap-4">
          <h2 id="social-login-heading" className="text-lg text-[var(--g1-ink)]">{t('socialHeading')}</h2>
          <div className="flex flex-col gap-2">
            {enabled.has('discord') && (
              <a
                href="/auth/discord/authorize"
                className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--g1-discord)] px-4 text-sm font-semibold text-[var(--g1-ink)] transition-transform duration-150 active:scale-[0.97]"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                {t('discord')}
              </a>
            )}
            {enabled.has('google') && (
              <a
                href="/auth/google/authorize"
                className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--g1-line)] bg-[var(--g1-night)] px-4 text-sm font-semibold text-[var(--g1-ink)] transition-transform duration-150 hover:border-[var(--g1-gold)] active:scale-[0.97]"
              >
                {t('google')}
              </a>
            )}
            {!enabled.has('discord') && !enabled.has('google') && (
              <p className="text-sm text-[var(--g1-muted)]">{t('socialUnavailable')}</p>
            )}
          </div>
          <p className="text-xs leading-relaxed text-[var(--g1-muted)]">
            {t('agreePrefix')}{' '}
            <Link href="/terms" prefetch={false} className="text-[var(--g1-gold)] underline">
              {t('terms')}
            </Link>{' '}
            {t('and')}{' '}
            <Link href="/privacy" prefetch={false} className="text-[var(--g1-gold)] underline">
              {t('privacy')}
            </Link>
            {t('agreeSuffix')}
          </p>
        </section>
      </div>
    </div>
  );
}
