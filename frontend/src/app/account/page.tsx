import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, KeyRound, ShieldAlert, ShieldCheck, Smartphone, UserCheck } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { RefreshOnReturn } from '@/components/refresh-on-return';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatDay } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { DeleteAccountForm, LinkButton, ReauthButton, UnlinkButton } from './account-forms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '내 계정 관리',
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
    <div data-page="account" className="mx-auto w-full max-w-4xl space-y-6 pb-16 pt-2 sm:space-y-8 sm:pt-4">
      <RefreshOnReturn when={reauth === 'done' || linked !== undefined} />

      {/* Header Banner */}
      <div className="flex flex-col gap-2 border-b border-border/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-semibold text-primary">
              보안 인증됨
            </Badge>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            내 계정 관리
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            로그인 수단과 보안 설정을 안전하게 관리할 수 있어요.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="outline" size="sm" asChild className="rounded-xl border-border/80 text-xs">
            <Link href="/account/security">
              <Smartphone className="mr-1.5 size-3.5 text-primary" />
              로그인 기기 관리
            </Link>
          </Button>
        </div>
      </div>

      {reauth === 'done' && (
        <Alert className="border-primary/30 bg-primary/5">
          <ShieldCheck className="size-4 text-primary" />
          <AlertDescription className="text-xs font-medium">
            본인 확인이 완료되었습니다. 15분간 중요한 계정 설정을 변경할 수 있습니다.
          </AlertDescription>
        </Alert>
      )}

      {linked && PROVIDER_NAME[linked] && (
        <Alert className="border-emerald-500/30 bg-emerald-500/5">
          <UserCheck className="size-4 text-emerald-500" />
          <AlertDescription className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {PROVIDER_NAME[linked]} 계정이 안전하게 연결되었습니다.
          </AlertDescription>
        </Alert>
      )}

      {/* Grid: Main Sections & Fast Links */}
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="space-y-6">
          {/* Section 1: Linked Sign-in Methods */}
          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">연결된 로그인 수단</CardTitle>
                  <CardDescription className="text-xs">
                    로그인 및 본인 인증에 사용할 수 있는 계정 목록입니다.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-[11px]">
                  {identities.length}개 연결됨
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {identityData === null ? (
                <EmptyState
                  title="연결된 로그인 수단을 불러올 수 없어요."
                  description="페이지를 새로고침하거나 잠시 후 다시 시도해 주세요."
                />
              ) : (
                <div className="divide-y divide-border/60 rounded-xl border border-border/70 bg-background/60">
                  {identities.map((identity) => (
                    <div
                      key={identity.identityId}
                      className="flex flex-col gap-3 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <KeyRound className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {PROVIDER_NAME[identity.provider] ?? identity.provider}
                            </span>
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              {identity.displayName}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            연결일: <time dateTime={identity.linkedAt}>{formatDay(identity.linkedAt)}</time>
                          </p>
                        </div>
                      </div>

                      <div>
                        {identities.length > 1 ? (
                          <UnlinkButton identityId={identity.identityId} />
                        ) : (
                          <span className="text-xs text-muted-foreground">기본 로그인 수단</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Security Verification */}
          {(oauthIdentity || hasLocalIdentity) && (
            <Card className="border-border/80 bg-card/90 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">보안 점검 및 재인증</CardTitle>
                <CardDescription className="text-xs">
                  로그인 수단 해제나 계정 삭제와 같은 민감한 변경 전 15분 유효 본인 확인을 진행합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {oauthIdentity ? (
                  <ReauthButton provider={oauthIdentity.provider} />
                ) : (
                  <Link
                    href="/account/security"
                    className="inline-flex min-h-11 items-center rounded-xl border border-border/80 px-4 text-xs font-semibold hover:bg-accent"
                  >
                    이메일·비밀번호로 본인 확인 <ChevronRight className="ml-1 size-3.5" />
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section 3: Add other identity */}
          {available.length > 0 && (
            <Card className="border-border/80 bg-card/90 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">다른 로그인 수단 추가</CardTitle>
                <CardDescription className="text-xs">
                  소셜 계정을 추가로 연결하여 더 안전하고 편리하게 로그인하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {available.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 p-3.5"
                  >
                    <div>
                      <p className="text-sm font-medium">{PROVIDER_NAME[provider.id] ?? provider.id}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {linkedProviders.has(provider.id)
                          ? '이미 연결되어 있습니다.'
                          : '원클릭으로 연결을 추가합니다.'}
                      </p>
                    </div>
                    <div>
                      {linkedProviders.has(provider.id) ? (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          연결 완료
                        </Badge>
                      ) : (
                        <LinkButton provider={provider.id} label="연결하기" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Section 4: Deletion & Danger Zone */}
          <Card id="leave-moneyverse" className="border-destructive/30 bg-destructive/5 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="size-4" />
                <CardTitle className="text-sm font-semibold">서비스 탈퇴 및 계정 삭제</CardTitle>
              </div>
              <CardDescription className="text-xs">
                탈퇴 시 모든 기기에서 즉시 로그아웃되며 계정은 삭제 대기 상태로 전환됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <DeleteAccountForm />
            </CardContent>
          </Card>
        </div>

        {/* Aside Sidebar */}
        <aside className="space-y-4" aria-label="계정 관리 바로가기">
          <div className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              계정 도구 바로가기
            </h2>
            <nav className="mt-3 divide-y divide-border/60" aria-label="계정 관리 메뉴">
              <Link
                href="/account/security"
                className="flex min-h-11 items-center justify-between py-2.5 text-xs font-medium text-foreground transition-colors hover:text-primary"
              >
                <span>보안 및 활성 기기 관리</span>
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/account/notifications"
                className="flex min-h-11 items-center justify-between py-2.5 text-xs font-medium text-foreground transition-colors hover:text-primary"
              >
                <span>알림 수신 설정</span>
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/account/privacy"
                className="flex min-h-11 items-center justify-between py-2.5 text-xs font-medium text-foreground transition-colors hover:text-primary"
              >
                <span>개인정보 권리 센터</span>
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </Link>
            </nav>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 text-[11px] leading-relaxed text-muted-foreground">
            <p>
              개인정보 및 보안 데이터는 암호화되어 안전하게 보관됩니다. 문의 사항은 지원 센터를 이용해
              주세요.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
