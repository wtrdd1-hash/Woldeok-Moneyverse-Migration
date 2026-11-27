import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { PrivacyDocument } from '@/components/policy/privacy-document';
import { TermsDocument } from '@/components/policy/terms-document';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiOrNull } from '@/lib/api';
import { currentViewer } from '@/lib/viewer';
import { ConsentForm } from './consent-form';
import { LoginProvidersView } from './login-providers-view';
import type { Copy } from '@/lib/copy';
import { pick } from '@/lib/copy';
import { getServerLocale } from '@/lib/locale-server';
import { COPY, ERROR_COPY } from './copy';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return { title: pick(await getServerLocale(), COPY.title), robots: { index: false, follow: false } };
}

const ERRORS: Readonly<Record<string, Copy>> = ERROR_COPY;

export default async function LoginPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly error?: string; readonly password_reset?: string }>;
}) {
  const [{ error, password_reset }, viewer, policy, locale] = await Promise.all([
    searchParams,
    currentViewer(),
    apiOrNull<{ termsVersion: string; privacyVersion: string }>('/api/v1/auth/policy'),
    getServerLocale(),
  ]);

  if (viewer.signedIn && viewer.consentCurrent) {
    redirect('/');
  }

  const errorCopy = error ? ERRORS[error] : undefined;
  const errorMessage = errorCopy ? pick(locale, errorCopy) : undefined;

  if (!viewer.signedIn) {
    return <LoginProvidersView {...(errorMessage ? { error: errorMessage } : {})} {...(password_reset === '1' ? { notice: pick(locale, COPY.passwordReset) } : {})} />;
  }

  return (
    <div data-page="login" className="mv-page mv-page--utility grid gap-6">
      <PageHeader title={pick(locale, COPY.consentTitle)}>
        {pick(locale, COPY.consentLead)}
      </PageHeader>

      {policy === null ? (
        <Alert variant="destructive">
          <AlertDescription>
            {pick(locale, COPY.policyUnavailable)}
          </AlertDescription>
        </Alert>
      ) : (
        <ConsentForm
          termsVersion={policy.termsVersion}
          privacyVersion={policy.privacyVersion}
          terms={<TermsDocument />}
          privacy={<PrivacyDocument />}
          {...(errorMessage ? { error: errorMessage } : {})}
        />
      )}
    </div>
  );
}
