import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { Accent, PageHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatDay, formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import {
  DeleteAccountForm,
  LinkButton,
  PrivacyRequestForm,
  ReauthButton,
  UnlinkButton,
} from './account-forms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '내 계정',
  robots: { index: false, follow: false },
};

interface Identity {
  readonly identityId: string;
  readonly provider: string;
  readonly displayName: string;
  readonly linkedAt: string;
}

interface PrivacyRequest {
  readonly requestId: string;
  readonly requestType: string;
  readonly detail: string | null;
  readonly status: string;
  readonly createdAt: string;
}

const PROVIDER_NAME: Readonly<Record<string, string>> = {
  discord: 'Discord',
  google: 'Google',
};

const REQUEST_TYPE_NAME: Readonly<Record<string, string>> = {
  access: '개인정보 열람 요청',
  correction: '개인정보 정정 요청',
  restriction: '개인정보 처리 제한 요청',
  withdrawal: '개인정보 동의 철회 요청',
  deletion: '개인정보 삭제 요청',
};

export default async function AccountPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly linked?: string; readonly reauth?: string }>;
}) {
  await requireMember();
  const { linked, reauth } = await searchParams;

  const [identityData, providerData, privacyData] = await Promise.all([
    apiOrNull<{ identities: Identity[] }>('/api/v1/account/identities'),
    apiOrNull<{ providers: { id: string; enabled: boolean }[] }>('/api/v1/auth/providers'),
    apiOrNull<{ requests: PrivacyRequest[] }>('/api/v1/privacy/requests'),
  ]);

  const identities = identityData?.identities ?? [];
  const linkedProviders = new Set(identities.map((identity) => identity.provider));
  const available = (providerData?.providers ?? []).filter((provider) => provider.enabled);
  const firstIdentity = identities[0];

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="ACCOUNT & ACCESS"
        title={
          <>
            내 계정은
            <br />
            <Accent>내가 직접 관리해요.</Accent>
          </>
        }
      >
        로그인 수단을 연결하거나 해제하고, 서비스 이용을 중단할 수 있어요. 중요한 변경은
        서버에서 다시 확인하고 기록합니다.
      </PageHeader>

      {reauth === 'done' && (
        <Alert>
          <AlertDescription>
            본인 확인이 완료됐어요. 15분 동안 중요한 계정 변경을 진행할 수 있어요.
          </AlertDescription>
        </Alert>
      )}
      {linked && PROVIDER_NAME[linked] && (
        <Alert>
          <AlertDescription>{PROVIDER_NAME[linked]} 계정을 연결했어요.</AlertDescription>
        </Alert>
      )}

      <section id="sign-in-methods" className="grid gap-3" aria-labelledby="identity-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              SIGN-IN METHODS
            </p>
            <h2 id="identity-title" className="text-lg font-medium">
              연결된 로그인 수단
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            최소 하나의 로그인 수단은 남겨 두어야 해요.
          </p>
        </div>

        {identityData === null ? (
          <EmptyState
            title="연결된 로그인 수단을 불러올 수 없어요."
            description="새 로그인 수단을 연결하기 전에 페이지를 새로고침하거나 다시 로그인해 주세요."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {identities.map((identity) => (
              <Card key={identity.identityId} className="gap-3">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">
                    연결됨
                  </Badge>
                  <CardTitle className="text-base">
                    {PROVIDER_NAME[identity.provider] ?? identity.provider}
                  </CardTitle>
                  <CardDescription>{identity.displayName}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <p className="text-xs text-muted-foreground">
                    연결{' '}
                    <time dateTime={identity.linkedAt}>{formatDay(identity.linkedAt)}</time>
                  </p>
                  {identities.length > 1 ? (
                    <UnlinkButton identityId={identity.identityId} />
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      마지막 로그인 수단은 해제할 수 없어요.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {firstIdentity && (
        <Card>
          <CardHeader>
            <CardDescription>SECURITY CHECK</CardDescription>
            <CardTitle>중요한 변경 전 본인 확인.</CardTitle>
            <CardDescription>
              로그인 수단 해제, 계정 삭제와 관리자 사용자 제한은 최근 OAuth 본인 확인이 필요해요.
              연결된 로그인 수단으로 한 번 더 확인하면 15분 동안 보호된 작업을 진행할 수 있어요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReauthButton provider={firstIdentity.provider} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardDescription>ADD A SIGN-IN METHOD</CardDescription>
          <CardTitle>다른 로그인 수단 연결하기.</CardTitle>
          <CardDescription>
            새 로그인은 제공자 인증을 거친 뒤 현재 계정에만 연결됩니다. 이름이나 이메일로 계정을
            찾거나 합치지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              지금은 추가 로그인 제공자가 설정되지 않았어요. 현재 로그인 수단은 그대로 유지됩니다.
            </p>
          ) : (
            available.map((provider) => (
              <div
                key={provider.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {PROVIDER_NAME[provider.id] ?? provider.id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {linkedProviders.has(provider.id)
                      ? '이 계정에 이미 연결되어 있어요.'
                      : '제공자 인증을 거쳐 이 계정에 연결합니다.'}
                  </p>
                </div>
                {linkedProviders.has(provider.id) ? (
                  <Badge variant="outline">연결됨</Badge>
                ) : (
                  <LinkButton provider={provider.id} label="연결하기 →" />
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <section id="privacy-requests" className="grid gap-3" aria-labelledby="privacy-request-title">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            PRIVACY REQUESTS
          </p>
          <h2 id="privacy-request-title" className="text-lg font-medium">
            내 정보에 관한 요청 남기기.
          </h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            열람·정정·처리 제한·동의 철회·삭제 요청을 내 계정으로 기록할 수 있어요. 이 양식은
            이메일·파일·데이터 전달 주소를 받지 않으며, 요청 자체가 즉시 처리 완료를 뜻하지는
            않습니다.{' '}
            <Link href="/privacy#privacy-rights" className="text-primary">
              이용자 권리와 처리 기준 보기 →
            </Link>
          </p>
        </div>

        {privacyData === null ? (
          <EmptyState
            title="개인정보 요청 기록을 지금 불러올 수 없어요."
            description="계정 설정은 그대로 사용할 수 있습니다."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent>
                <PrivacyRequestForm />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">내 요청 기록</CardTitle>
              </CardHeader>
              <CardContent>
                {privacyData.requests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    아직 기록한 개인정보 요청이 없어요.
                  </p>
                ) : (
                  <ul className="grid gap-3">
                    {privacyData.requests.map((request) => (
                      <li key={request.requestId} className="border-b pb-3 last:border-b-0 last:pb-0">
                        <p className="text-sm font-medium">
                          {REQUEST_TYPE_NAME[request.requestType] ?? request.requestType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <time dateTime={request.createdAt}>
                            {formatMoment(request.createdAt)}
                          </time>{' '}
                          · 접수됨
                        </p>
                        {request.detail && <p className="mt-1 text-sm">{request.detail}</p>}
                        <code className="mt-1 block overflow-x-auto font-mono text-[0.7rem] text-muted-foreground">
                          {request.requestId}
                        </code>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      <Card id="leave-moneyverse" className="border-destructive/40">
        <CardHeader>
          <CardDescription>LEAVE MONEYVERSE</CardDescription>
          <CardTitle>서비스 이용 중단</CardTitle>
          <CardDescription>
            이 요청을 보내면 모든 로그인 세션이 종료되고 계정은 삭제 상태로 전환됩니다. 경제
            원장과 보안·감사 기록은 개인정보처리방침에 적힌 보존 기준에 따라 처리됩니다.{' '}
            <Link href="/privacy#privacy-rights" className="text-primary">
              보유 기간과 이용자 권리 보기 →
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountForm />
        </CardContent>
      </Card>
    </div>
  );
}
