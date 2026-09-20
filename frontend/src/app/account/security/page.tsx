import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Laptop, ShieldCheck, Smartphone, KeyRound, AlertTriangle, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import {
  beginSecurityReauthentication,
  terminateOtherSessions,
  terminateAllSessions,
  terminateSession,
  reauthenticateWithLocalPassword,
  changeLocalPassword,
  requestLocalEmailChange,
} from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '로그인 기기 및 보안 관리',
  robots: { index: false, follow: false },
};

interface SecuritySession {
  readonly sessionId: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly reauthenticatedAt: string | null;
  readonly current: boolean;
  readonly administratorSession: boolean;
  readonly lastSeenAt: string;
  readonly deviceLabel: string;
}

interface SecurityEvent {
  readonly type: string;
  readonly createdAt: string;
}

interface Identity {
  readonly provider: string;
}

const SECURITY_EVENT_LABEL: Readonly<Record<string, string>> = {
  local_registration_completed: '이메일 계정 가입 완료',
  local_login_succeeded: '이메일 계정 로그인',
  local_password_reset_requested: '비밀번호 재설정 요청',
  local_password_reset_completed: '비밀번호 재설정 완료',
  local_password_changed: '비밀번호 변경',
};

const PROVIDER_NAME: Readonly<Record<string, string>> = {
  discord: 'Discord',
  google: 'Google',
};

export default async function AccountSecurityPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireMember();
  const params = await searchParams;
  const [sessionData, identityData, eventData] = await Promise.all([
    apiOrNull<{ sessions: SecuritySession[] }>('/api/v1/account/security/sessions'),
    apiOrNull<{ identities: Identity[] }>('/api/v1/account/identities'),
    apiOrNull<{ events: SecurityEvent[] }>('/api/v1/account/security/events'),
  ]);
  const sessions = sessionData?.sessions ?? [];
  const identities = identityData?.identities ?? [];
  const hasLocalIdentity = identities.some((identity) => identity.provider === 'local_email');
  const oauthIdentities = identities.filter((identity) => identity.provider !== 'local_email');
  const events = eventData?.events ?? [];
  const otherCount = sessions.filter((session) => !session.current).length;
  const error = typeof params.error === 'string' ? params.error : null;
  const revoked = typeof params.revoked === 'string' ? params.revoked : null;

  return (
    <div data-page="account-security" className="mx-auto w-full max-w-4xl space-y-6 pb-16 pt-2 sm:space-y-8 sm:pt-4">
      {/* Top Nav Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" className="min-h-11 w-fit">
          <Link href="/account">
            <ChevronLeft className="mr-1 size-4" /> 내 계정으로 돌아가기
          </Link>
        </Button>
      </div>

      {/* Header Banner */}
      <div className="border-b border-border/80 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          로그인 기기 및 보안
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          현재 로그인 중인 기기와 세션을 확인하고, 다른 기기에서 원격으로 안전하게 로그아웃할 수 있습니다.
        </p>
      </div>

      {/* Alerts */}
      {params.reauth === 'done' && (
        <Alert className="border-primary/30 bg-primary/5">
          <ShieldCheck className="size-4 text-primary" />
          <AlertDescription className="text-xs font-medium">
            본인 확인이 완료되었습니다. 민감한 보안 작업을 안전하게 계속할 수 있습니다.
          </AlertDescription>
        </Alert>
      )}
      {params.email === 'verification-sent' && (
        <Alert className="border-primary/30 bg-primary/5">
          <AlertDescription className="text-xs font-medium">
            새 로그인 이메일로 확인 링크를 보냈습니다. 링크 확인 완료 시 모든 세션이 종료됩니다.
          </AlertDescription>
        </Alert>
      )}
      {params.password === 'changed' && (
        <Alert className="border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
          <AlertDescription className="text-xs font-medium">
            비밀번호를 성공적으로 변경하였으며 다른 로그인 세션을 모두 안전하게 종료했습니다.
          </AlertDescription>
        </Alert>
      )}
      {params.session === 'revoked' && (
        <Alert>
          <AlertDescription className="text-xs font-medium">
            선택한 기기의 세션을 원격으로 종료했습니다.
          </AlertDescription>
        </Alert>
      )}
      {revoked !== null && (
        <Alert>
          <AlertDescription className="text-xs font-medium">
            다른 활성 세션 {revoked}개를 모두 안전하게 종료했습니다.
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription className="text-xs font-medium">
            {error === 'reauth-required'
              ? '세션을 종료하거나 보안 설정을 변경하려면 최근 본인 확인이 필요합니다.'
              : error === 'local-reauth'
                ? '이메일 또는 비밀번호를 다시 확인해 주세요.'
                : error === 'email-change'
                  ? '이메일 변경을 시작하지 못했습니다. 본인 확인 후 다시 시도해 주세요.'
                  : error === 'password-mismatch'
                    ? '새 비밀번호 확인 값이 일치하지 않습니다.'
                    : error === 'password-change'
                      ? '최근 본인 확인 후 다시 비밀번호 변경을 시도해 주세요.'
                      : '요청을 완료하지 못했습니다. 세션 상태를 새로고침 후 다시 시도해 주세요.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Sessions Card */}
      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">로그인된 기기 목록</CardTitle>
              <CardDescription className="text-xs">
                현재 계정에 로그인된 모든 브라우저 및 디바이스입니다.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {sessionData === null ? (
            <p className="py-6 text-center text-xs text-muted-foreground">세션 정보를 불러오지 못했습니다.</p>
          ) : sessions.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">활성 세션이 없습니다.</p>
          ) : (
            <div className="divide-y divide-border/60 rounded-xl border border-border/70 bg-background/60">
              {sessions.map((session) => {
                const isMobile = /mobile|phone|android|ios/i.test(session.deviceLabel);
                return (
                  <div
                    key={session.sessionId}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={'flex size-10 items-center justify-center rounded-xl ' + (session.current ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                        {isMobile ? <Smartphone className="size-5" /> : <Laptop className="size-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {session.deviceLabel}
                          </span>
                          {session.current ? (
                            <Badge className="bg-primary/15 text-[10px] font-semibold text-primary hover:bg-primary/20">
                              현재 기기
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              다른 기기
                            </Badge>
                          )}
                          {session.administratorSession && (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              운영 콘솔
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          최근 활동 {formatMoment(session.lastSeenAt)} · 로그인 {formatMoment(session.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div>
                      {!session.current ? (
                        <form action={terminateSession} className="w-full sm:w-auto">
                          <input type="hidden" name="sessionId" value={session.sessionId} />
                          <Button type="submit" variant="outline" className="min-h-11 w-full sm:w-auto">이 세션 종료</Button>
                        </form>
                      ) : (
                        <span className="text-xs text-muted-foreground">사용 중</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Session Termination */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">다른 세션 전체 종료</CardTitle>
            <CardDescription className="text-xs">
              현재 브라우저 세션은 유지하고 나머지 활성 세션만 종료합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form action={terminateOtherSessions} className="w-full sm:w-auto">
              <Button type="submit" variant="destructive" disabled={otherCount === 0} className="min-h-11 w-full sm:w-auto">
                <LogOut className="mr-1.5 size-4" />
                다른 세션 {otherCount}개 종료
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-card/90 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-destructive">모든 기기에서 로그아웃</CardTitle>
            <CardDescription className="text-xs">
              다른 활성 세션을 먼저 종료한 뒤 현재 브라우저에서도 로그아웃합니다. 최근 본인 확인이 필요합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form action={terminateAllSessions} className="w-full sm:w-auto">
              <Button type="submit" variant="destructive" className="min-h-11 w-full sm:w-auto">
                모든 기기에서 로그아웃
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Security Reauthentication Card */}
      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">민감한 작업 본인 확인</CardTitle>
          <CardDescription className="text-xs">
            다른 세션 종료는 최근 본인 확인 후에만 허용됩니다. 연결된 이메일·비밀번호 또는 OAuth 로그인 수단으로 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex flex-wrap gap-2.5">
            {oauthIdentities.map((identity) => (
              <form action={beginSecurityReauthentication} key={identity.provider} className="w-full sm:w-auto">
                <input type="hidden" name="provider" value={identity.provider} />
                <Button type="submit" variant="outline" className="min-h-11 w-full sm:w-auto">
                  <KeyRound className="mr-1.5 size-3.5 text-primary" />
                  {PROVIDER_NAME[identity.provider] ?? identity.provider}로 본인 확인
                </Button>
              </form>
            ))}
          </div>

          {hasLocalIdentity ? (
            <form action={reauthenticateWithLocalPassword} className="mt-2 grid max-w-sm gap-3 rounded-xl border border-border/60 bg-background/50 p-4">
              <p className="text-xs font-semibold text-foreground">이메일 계정으로 본인 확인</p>
              <div className="grid gap-1.5">
                <Label htmlFor="reauth-email" className="text-[11px] text-muted-foreground">이메일</Label>
                <input id="reauth-email" name="email" type="email" autoComplete="username" required className="min-h-11 rounded-md border bg-background px-3 text-base" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="reauth-password" className="text-[11px] text-muted-foreground">비밀번호</Label>
                <input id="reauth-password" name="password" type="password" autoComplete="current-password" required className="min-h-11 rounded-md border bg-background px-3 text-base" />
              </div>
              <Button type="submit" variant="outline" className="min-h-11">
                이메일·비밀번호로 본인 확인
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>

      {/* Local Password & Email Settings (if local identity present) */}
      {hasLocalIdentity ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">비밀번호 변경</CardTitle>
              <CardDescription className="text-xs">
                최근 본인 확인 후 새 비밀번호로 변경합니다. 변경하면 현재 세션을 제외한 다른 세션은 종료됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form action={changeLocalPassword} className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="new-password" className="text-xs text-muted-foreground">새 비밀번호</Label>
                  <input id="new-password" name="password" type="password" autoComplete="new-password" maxLength={128} required className="min-h-11 rounded-md border bg-background px-3 text-base" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="confirm-password" className="text-xs text-muted-foreground">새 비밀번호 확인</Label>
                  <input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" maxLength={128} required className="min-h-11 rounded-md border bg-background px-3 text-base" />
                </div>
                <Button type="submit" className="min-h-11">
                  비밀번호 변경
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">로그인 이메일 변경</CardTitle>
              <CardDescription className="text-xs">
                최근 본인 확인 후 새 이메일로 확인 링크를 보냅니다. 링크를 확인하면 로그인 이메일이 바뀌고 모든 세션이 종료됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form action={requestLocalEmailChange} className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="new-login-email" className="text-xs text-muted-foreground">새 로그인 이메일</Label>
                  <input id="new-login-email" name="email" type="email" autoComplete="email" maxLength={254} required className="min-h-11 rounded-md border bg-background px-3 text-base" />
                </div>
                <Button type="submit" className="min-h-11">
                  확인 이메일 보내기
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Security Audit Events */}
      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">최근 보안 활동</CardTitle>
          <CardDescription className="text-xs">계정 접근 및 주요 보안 설정 변경 이력입니다.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {eventData === null ? (
            <p className="py-3 text-xs text-muted-foreground">보안 활동을 불러오지 못했습니다.</p>
          ) : events.length === 0 ? (
            <p className="py-3 text-xs text-muted-foreground">최근 보안 활동이 없습니다.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {events.slice(0, 5).map((event, index) => (
                <div key={event.createdAt + '-' + event.type + '-' + index} className="flex items-center justify-between py-2.5 text-xs">
                  <span className="font-medium text-foreground">{SECURITY_EVENT_LABEL[event.type] ?? '계정 보안 활동'}</span>
                  <span className="text-muted-foreground">{formatMoment(event.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
