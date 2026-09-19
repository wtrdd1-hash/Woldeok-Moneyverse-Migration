import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { RefreshOnReturn } from '@/components/refresh-on-return';
import { Accent, PageHeader, SectionHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatDay } from '@/lib/money';
import { requireMember } from '@/lib/session';
import {
  DeleteAccountForm,
  LinkButton,
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

const PROVIDER_NAME: Readonly<Record<string, string>> = {
  discord: 'Discord',
  google: 'Google',
  local_email: '이메일·비밀번호',
};



export default async function AccountPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly linked?: string; readonly reauth?: string }>;
}) {
  await requireMember();
  const { linked, reauth } = await searchParams;

  const [identityData, providerData] = await Promise.all([
    apiOrNull<{ identities: Identity[] }>('/api/v1/account/identities'),
    apiOrNull<{ providers: { id: string; enabled: boolean }[] }>('/api/v1/auth/providers'),
  ]);

  const identities = identityData?.identities ?? [];
  const linkedProviders = new Set(identities.map((identity) => identity.provider));
  const available = (providerData?.providers ?? []).filter((provider) => provider.enabled);
  const oauthIdentity = identities.find((identity) => identity.provider !== 'local_email');
  const hasLocalIdentity = identities.some((identity) => identity.provider === 'local_email');

  return (
    <div data-page="account" className="mv-page mv-page--member grid gap-8">
      {/* Coming back from a provider changed what every other screen would
          say, and those screens are already in the client router cache. This
          drops it, so `/admin` stops telling somebody who has just confirmed
          their identity to go and confirm their identity. */}
      <RefreshOnReturn when={reauth === 'done' || linked !== undefined} />
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
        <SectionHeader
          eyebrow="SIGN-IN METHODS"
          title="연결된 로그인 수단"
          id="identity-title"
          action={
            <p className="text-xs text-muted-foreground">
              최소 하나의 로그인 수단은 남겨 두어야 해요.
            </p>
          }
        />

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

      {(oauthIdentity || hasLocalIdentity) && (
        <Card>
          <CardHeader>
            <CardDescription>SECURITY CHECK</CardDescription>
            <CardTitle>중요한 변경 전 본인 확인.</CardTitle>
            <CardDescription>
              로그인 수단 해제, 계정 삭제와 관리자 사용자 제한은 최근 본인 확인이 필요해요.
              연결된 로그인 수단으로 한 번 더 확인하면 15분 동안 보호된 작업을 진행할 수 있어요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {oauthIdentity ? (
              <ReauthButton provider={oauthIdentity.provider} />
            ) : (
              <Link
                href="/account/security"
                className="inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-medium"
              >
                이메일·비밀번호로 본인 확인 →
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardDescription>NOTIFICATIONS</CardDescription><CardTitle>알림 설정.</CardTitle><CardDescription>목표와 NPC 주문 알림 수신 여부를 계정에서 관리합니다.</CardDescription></CardHeader>
        <CardContent><Link href="/account/notifications" className="inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-medium">알림 설정 열기 →</Link></CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardDescription>PRIVACY CENTER</CardDescription>
          <CardTitle>개인정보 요청과 처리 현황.</CardTitle>
          <CardDescription>열람·정정·처리 제한·동의 철회·삭제 요청을 전용 개인정보 센터에서 기록하고 확인합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/account/privacy" className="inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-medium">
            개인정보 센터 열기 →
          </Link>
        </CardContent>
      </Card>

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
