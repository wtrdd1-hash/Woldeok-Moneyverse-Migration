import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { PrivacyDocument } from '@/components/policy/privacy-document';
import { TermsDocument } from '@/components/policy/terms-document';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiOrNull } from '@/lib/api';
import { currentViewer } from '@/lib/viewer';
import { ConsentForm } from './consent-form';

/** Reads the session to decide whether the visitor belongs here at all. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '로그인 전 필수 동의',
  robots: { index: false, follow: false },
};

/**
 * The messages the API and the OAuth round trip can end in. Carried across
 * from the original view verbatim: each names a different thing that went
 * wrong and a different thing to do about it.
 */
const ERRORS: Readonly<Record<string, string>> = {
  login_required: '로그인이 필요한 화면이에요. 먼저 로그인해 주세요.',
  consent_required: '로그인 전에 최신 약관과 개인정보처리방침에 동의해 주세요.',
  oauth_session: '로그인 세션이 만료되었습니다. 다시 시도해 주세요.',
  oauth_state: '로그인 요청을 확인할 수 없습니다. 다시 시도해 주세요.',
  oauth_cancelled: '로그인이 취소되었습니다.',
  oauth_response: '로그인 제공자의 응답을 확인할 수 없습니다.',
  oauth_verification: '로그인 정보를 확인하지 못했습니다. 다시 시도해 주세요.',
  oauth_login: '로그인을 완료하지 못했습니다. 다시 시도해 주세요.',
  provider_unavailable: '로그인 제공자가 아직 연결되지 않았어요.',
};

export default async function LoginPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly error?: string }>;
}) {
  const [{ error }, viewer, policy] = await Promise.all([
    searchParams,
    currentViewer(),
    apiOrNull<{ termsVersion: string; privacyVersion: string }>('/api/v1/auth/policy'),
  ]);

  // Already signed in and already current: there is nothing to consent to.
  if (viewer.signedIn && viewer.consentCurrent) redirect('/');

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="WOLDEOK MONEYVERSE" title="로그인 전 필수 동의">
        서비스 화폐·보상은 게임 내 가상 데이터이며 현금 환전이나 실제 투자 수익을 제공하지
        않습니다.
      </PageHeader>

      {policy === null ? (
        <Alert variant="destructive">
          <AlertDescription>
            지금은 게시된 정책을 불러올 수 없어요. 잠시 후 다시 시도해 주세요.
          </AlertDescription>
        </Alert>
      ) : (
        <ConsentForm
          termsVersion={policy.termsVersion}
          privacyVersion={policy.privacyVersion}
          terms={<TermsDocument />}
          privacy={<PrivacyDocument />}
          {...(error && ERRORS[error] ? { error: ERRORS[error] } : {})}
        />
      )}
    </div>
  );
}
