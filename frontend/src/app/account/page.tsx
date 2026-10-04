import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Bell,
  ChevronRight,
  Edit3,
  ExternalLink,
  KeyRound,
  Lock,
  Mail,
  Plus,
  QrCode,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  UserCheck,
  UserX,
} from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { RefreshOnReturn } from '@/components/refresh-on-return';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ProfileAvatar } from '@/app/profile/profile-avatar';
import { jobLabel, titleLabel } from '@/app/profile/profile';
import { apiOrNull } from '@/lib/api';
import { formatDay } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { DeleteAccountForm, LinkButton, ReauthButton, UnlinkButton } from './account-forms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '내 계정 센터 - 월덕 머니버스',
  robots: { index: false, follow: false },
};

interface Identity {
  readonly identityId: string;
  readonly provider: string;
  readonly displayName: string;
  readonly linkedAt: string;
}

interface OwnProfileResponse {
  readonly displayName?: string | null;
  readonly imageUrl?: string | null;
  readonly joinedAt?: string;
  readonly jobType?: string | null;
  readonly jobLevel?: number;
  readonly workCompletions?: string;
  readonly visibility?: string;
  readonly featuredTitle?: string | null;
  readonly email?: string | null;
  readonly display_name?: string | null;
  readonly image_url?: string | null;
  readonly joined_at?: string;
  readonly job_type?: string | null;
  readonly job_level?: number;
  readonly featured_title?: string | null;
  readonly profile?: {
    readonly displayName?: string | null;
    readonly imageUrl?: string | null;
    readonly joinedAt?: string;
    readonly jobType?: string | null;
    readonly jobLevel?: number;
    readonly featuredTitle?: string | null;
    readonly email?: string | null;
    readonly display_name?: string | null;
    readonly image_url?: string | null;
    readonly joined_at?: string;
    readonly job_type?: string | null;
    readonly job_level?: number;
    readonly featured_title?: string | null;
  };
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

  const [identityData, providerData, profileData] = await Promise.all([
    apiOrNull<{ identities: Identity[] }>('/api/v1/account/identities'),
    apiOrNull<{ providers: { id: string; enabled: boolean }[] }>('/api/v1/auth/providers'),
    apiOrNull<OwnProfileResponse>('/api/v1/profile'),
  ]);

  const identities = identityData?.identities ?? [];
  const linkedProviders = new Set(identities.map((identity) => identity.provider));
  const available = (providerData?.providers ?? []).filter((provider) => provider.enabled);
  const oauthIdentity = identities.find((identity) => identity.provider !== 'local_email');
  const hasLocalIdentity = identities.some((identity) => identity.provider === 'local_email');

  // 다계층 실제 회원 프로필 닉네임 및 세부 데이터 감지 (Hybrid Resolution)
  const profileObj = profileData?.profile ?? profileData;
  const rawDisplayName = profileObj?.displayName ?? profileObj?.display_name;
  const rawImageUrl = profileObj?.imageUrl ?? profileObj?.image_url;
  const userEmail = profileObj?.email;
  const joinedDate = profileObj?.joinedAt ?? profileObj?.joined_at ?? oauthIdentity?.linkedAt;
  const userJobType = profileObj?.jobType ?? profileObj?.job_type;
  const userJobLevel = profileObj?.jobLevel ?? profileObj?.job_level ?? 0;
  const userTitle = profileObj?.featuredTitle ?? profileObj?.featured_title;

  // 1순위: 사용자 설정 닉네임 -> 2순위: Discord/소셜 연동명 -> 3순위: 이메일 아이디 -> 4순위: 기본값
  const actualDisplayName =
    rawDisplayName?.trim() ||
    oauthIdentity?.displayName?.trim() ||
    (userEmail ? userEmail.split('@')[0] : null) ||
    '월덕 회원';

  // 계정 보안 종합 점수 (100점 만점 기준)
  const isSocialLinked = identities.some((i) => i.provider !== 'local_email');
  const hasMultipleIdentities = identities.length >= 2;
  const securityScore = Math.min(
    100,
    (isSocialLinked ? 35 : 20) + (hasMultipleIdentities ? 35 : 20) + 30,
  );

  return (
    <div data-page="account" className="mx-auto w-full max-w-6xl space-y-6 pb-20 pt-2 sm:space-y-8 sm:pt-4">
      <RefreshOnReturn when={reauth === 'done' || linked !== undefined} />

      {/* Top Breadcrumb & Clean Header */}
      <div className="flex flex-col gap-3 border-b border-border/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5 shrink-0" />
              보안 인증 계정
            </span>
            {userTitle && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-500">
                <Sparkles className="size-3 shrink-0" />
                {titleLabel(userTitle)}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            내 계정 관리
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            로그인 수단과 본인 인증, 실제 회원 프로필 및 기기 보안 설정을 한곳에서 안전하게 관리하세요.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild className="rounded-xl border-border/80 text-xs font-semibold hover:bg-muted/60 min-h-[40px]">
            <Link href="/profile">
              <Edit3 className="mr-1.5 size-3.5 text-primary shrink-0" />
              프로필 수정
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="rounded-xl border-border/80 text-xs font-semibold hover:bg-muted/60 min-h-[40px]">
            <Link href="/account/security">
              <Smartphone className="mr-1.5 size-3.5 text-primary shrink-0" />
              기기 및 세션 관리
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Alerts */}
      {reauth === 'done' && (
        <Alert className="border-primary/30 bg-primary/5 rounded-2xl">
          <ShieldCheck className="size-4 text-primary shrink-0" />
          <AlertDescription className="text-xs font-medium">
            본인 확인이 완료되었습니다. 15분간 중요한 계정 설정을 변경할 수 있습니다.
          </AlertDescription>
        </Alert>
      )}

      {linked && PROVIDER_NAME[linked] && (
        <Alert className="border-emerald-500/30 bg-emerald-500/5 rounded-2xl">
          <UserCheck className="size-4 text-emerald-500 shrink-0" />
          <AlertDescription className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {PROVIDER_NAME[linked]} 계정이 안전하게 연결되었습니다.
          </AlertDescription>
        </Alert>
      )}

      {/* 2026 Adaptive Bento Grid 2.0 (Linear/Stripe Style) */}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr] items-start">
        {/* Left Column: Real Member Profile Card & Quick Navigation Hub */}
        <aside className="space-y-5" aria-label="계정 관리 바로가기">
          {/* Apple ID Style Real Profile Summary Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-card/95 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
            <div className="flex flex-col items-center text-center">
              {/* Real Member Avatar or Fallback with 2026 Micro-Badge */}
              <div className="relative mb-3 flex items-center justify-center">
                <ProfileAvatar
                  name={actualDisplayName}
                  imageUrl={rawImageUrl ?? null}
                  className="size-20 shadow-md ring-2 ring-border/80"
                />
                <div
                  title="보안 인증 완료"
                  className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-background"
                >
                  <ShieldCheck className="size-3.5 shrink-0" />
                </div>
              </div>

              {/* Real Member Display Name */}
              <div className="min-w-0 max-w-full">
                <h2 className="text-lg font-bold text-foreground truncate" title={actualDisplayName}>
                  {actualDisplayName}
                </h2>
                {userEmail && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate" title={userEmail}>
                    {userEmail}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {userJobType ? `${jobLabel(userJobType)} (Lv.${userJobLevel})` : '인증된 커뮤니티 계정'}
                </p>
              </div>

              {/* Badges & Connected Status */}
              <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2">
                <Badge variant="secondary" className="rounded-lg text-[11px] font-semibold">
                  연결 수단 {identities.length}개
                </Badge>
                {joinedDate && (
                  <Badge variant="outline" className="rounded-lg text-[11px] font-medium border-border/80 text-muted-foreground">
                    가입: {formatDay(joinedDate)}
                  </Badge>
                )}
              </div>

              {/* Account Security Progress Score Widget */}
              <div className="mt-5 w-full rounded-xl border border-border/60 bg-muted/20 p-3 text-left">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">계정 보안 완성도</span>
                  <span className="font-mono tabular-nums font-bold text-primary">{securityScore}%</span>
                </div>
                <Progress value={securityScore} className="mt-2 h-1.5 bg-muted" />
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  {securityScore >= 90
                    ? '🛡️ 최고 등급 보안 보호 상태입니다.'
                    : '💡 추가 로그인 수단을 연동하면 계정 보호가 강화됩니다.'}
                </p>
              </div>
            </div>

            <Separator className="my-5 opacity-60" />

            {/* Account Fast Links (Tested Requirements Maintained) */}
            <div className="space-y-1">
              <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                계정 설정 바로가기
              </p>
              <nav className="space-y-1" aria-label="계정 관리 메뉴">
                <Link
                  href="/profile/settings"
                  className="flex min-h-11 items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 hover:text-primary"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                      <User className="size-3.5" />
                    </div>
                    <span className="truncate">프로필 및 치장 설정</span>
                  </div>
                  <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                </Link>

                <Link
                  href="/account/security"
                  className="flex min-h-11 items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 hover:text-primary"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <Lock className="size-3.5" />
                    </div>
                    <span className="truncate">보안 및 활성 기기 관리</span>
                  </div>
                  <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                </Link>

                <Link
                  href="/account/notifications"
                  className="flex min-h-11 items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 hover:text-primary"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                      <Bell className="size-3.5" />
                    </div>
                    <span className="truncate">알림 수신 설정</span>
                  </div>
                  <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                </Link>

                <Link
                  href="/account/privacy"
                  className="flex min-h-11 items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 hover:text-primary"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                      <Shield className="size-3.5" />
                    </div>
                    <span className="truncate">개인정보 권리 센터</span>
                  </div>
                  <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                </Link>
              </nav>
            </div>
          </div>

          {/* Security Tip Box */}
          <div className="rounded-2xl border border-zinc-800/80 bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
            <div className="flex items-center gap-2 text-primary font-bold mb-1.5">
              <Sparkles className="size-4 shrink-0" />
              <span>안전한 계정 관리 팁</span>
            </div>
            <p className="text-[11px]">
              소셜 로그인 수단을 2개 이상 등록해두면 계정 분실 시 언제든 안전하게 복구할 수 있습니다.
            </p>
          </div>
        </aside>

        {/* Right Column: Detailed Management Cards */}
        <main className="space-y-6">
          {/* Section 1: Linked Sign-in Methods */}
          <Card className="rounded-2xl border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">연결된 로그인 수단</CardTitle>
                  <CardDescription className="text-xs">
                    로그인 및 본인 인증에 사용할 수 있는 계정 목록입니다.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs font-bold px-2.5 py-0.5 rounded-lg shrink-0">
                  {identities.length}개 활성
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
                <div className="space-y-2.5">
                  {identities.map((identity) => (
                    <div
                      key={identity.identityId}
                      className="flex flex-col gap-3 rounded-xl border border-border/70 bg-background/60 p-4 transition-all hover:border-border sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs shrink-0">
                          <KeyRound className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-foreground">
                              {PROVIDER_NAME[identity.provider] ?? identity.provider}
                            </span>
                            <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground rounded-md truncate max-w-[180px]">
                              {identity.displayName}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            연결일: <time dateTime={identity.linkedAt}>{formatDay(identity.linkedAt)}</time>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {identities.length > 1 ? (
                          <UnlinkButton identityId={identity.identityId} />
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-2.5 py-1.5 rounded-lg inline-block">
                            기본 로그인 수단
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Security Verification & Re-auth */}
          {(oauthIdentity || hasLocalIdentity) && (
            <Card className="rounded-2xl border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                    <ShieldCheck className="size-4" />
                  </div>
                  <CardTitle className="text-base font-bold">보안 점검 및 재인증</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  로그인 수단 해제나 계정 삭제와 같은 민감한 변경 전 15분 유효 본인 확인을 진행합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-1">
                {oauthIdentity ? (
                  <ReauthButton provider={oauthIdentity.provider} />
                ) : (
                  <Link
                    href="/account/security"
                    className="inline-flex min-h-11 items-center rounded-xl border border-border/80 px-4 text-xs font-bold text-foreground transition-colors hover:bg-muted/70"
                  >
                    이메일·비밀번호로 본인 확인 <ChevronRight className="ml-1 size-3.5" />
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section 3: Add Other Identities */}
          {available.length > 0 && (
            <Card className="rounded-2xl border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Plus className="size-4" />
                  </div>
                  <CardTitle className="text-base font-bold">다른 로그인 수단 추가</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  소셜 계정을 추가로 연결하여 더 안전하고 편리하게 로그인하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-1">
                {available.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 p-3.5 transition-colors hover:bg-background/80"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-bold">{PROVIDER_NAME[provider.id] ?? provider.id}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {linkedProviders.has(provider.id)
                          ? '이미 계정에 연결되어 있습니다.'
                          : '원클릭으로 소셜 간편 로그인을 추가합니다.'}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {linkedProviders.has(provider.id) ? (
                        <Badge variant="outline" className="text-xs font-semibold text-muted-foreground rounded-lg">
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
          <Card id="leave-moneyverse" className="rounded-2xl border-destructive/30 bg-destructive/5 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="size-4 shrink-0" />
                <CardTitle className="text-sm font-bold">서비스 탈퇴 및 계정 삭제</CardTitle>
              </div>
              <CardDescription className="text-xs text-destructive/80">
                탈퇴 시 모든 기기에서 즉시 로그아웃되며 계정 데이터는 안전하게 삭제 대기 상태로 전환됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <DeleteAccountForm />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
