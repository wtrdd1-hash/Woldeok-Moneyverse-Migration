import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader, SectionHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  title: '계정 보안 센터',
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
    <div data-page="account-security" className="mv-page mv-page--member grid gap-6">
      <PageHeader eyebrow="ACCOUNT SECURITY" title="계정 보안 센터">
        로그인 중인 세션을 확인하고, 사용하지 않는 다른 세션을 종료할 수 있습니다.
      </PageHeader>

      {params.reauth === 'done' ? (
        <Alert><AlertDescription>본인 확인이 완료되었습니다. 민감한 보안 작업을 계속할 수 있습니다.</AlertDescription></Alert>
      ) : null}
      {params.email === 'verification-sent' ? (
        <Alert><AlertDescription>새 로그인 이메일로 확인 링크를 보냈습니다. 링크 확인이 끝나면 모든 세션이 종료됩니다.</AlertDescription></Alert>
      ) : null}
      {params.password === 'changed' ? (
        <Alert><AlertDescription>비밀번호를 변경했고 다른 로그인 세션을 모두 종료했습니다.</AlertDescription></Alert>
      ) : null}
      {params.session === 'revoked' ? (
        <Alert><AlertDescription>선택한 다른 세션을 종료했습니다.</AlertDescription></Alert>
      ) : null}
      {revoked !== null ? (
        <Alert><AlertDescription>다른 활성 세션 {revoked}개를 종료했습니다.</AlertDescription></Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error === 'reauth-required'
              ? '세션을 종료하려면 최근 본인 확인이 필요합니다.'
              : error === 'local-reauth'
                ? '이메일 또는 비밀번호를 확인한 뒤 다시 시도해 주세요.'
                : error === 'email-change'
                  ? '새 로그인 이메일 변경을 시작하지 못했습니다. 최근 본인 확인 후 다른 이메일로 다시 시도해 주세요.'
                : error === 'password-mismatch'
                  ? '새 비밀번호 확인 값이 일치하지 않습니다.'
                  : error === 'password-change'
                    ? '최근 본인 확인 후 다시 비밀번호 변경을 시도해 주세요.'
                : '요청을 완료하지 못했습니다. 세션 상태를 새로 확인해 주세요.'}
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-3" aria-labelledby="active-sessions">
        <SectionHeader id="active-sessions" eyebrow="SESSIONS" title="활성 세션" />
        {sessionData === null ? (
          <Card><CardContent className="pt-6 text-sm text-muted-foreground">세션 목록을 불러오지 못했습니다.</CardContent></Card>
        ) : sessions.length === 0 ? (
          <Card><CardContent className="pt-6 text-sm text-muted-foreground">표시할 활성 세션이 없습니다.</CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {sessions.map((session) => (
              <Card key={session.sessionId}>
                <CardHeader className="gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">
                      {session.deviceLabel}
                    </CardTitle>
                    {session.current ? <Badge>현재 사용 중</Badge> : <Badge variant="secondary">다른 세션</Badge>}
                    {session.administratorSession ? <Badge variant="outline">운영 콘솔 사용 이력</Badge> : null}
                  </div>
                  <CardDescription>
                    최근 활동 {formatMoment(session.lastSeenAt)} · 로그인 {formatMoment(session.createdAt)} · 만료 {formatMoment(session.expiresAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <div className="text-muted-foreground">
                    최근 본인 확인: {session.reauthenticatedAt ? formatMoment(session.reauthenticatedAt) : '기록 없음'}
                  </div>
                  {!session.current ? (
                    <form action={terminateSession} className="w-full sm:w-auto">
                      <input type="hidden" name="sessionId" value={session.sessionId} />
                      <Button type="submit" variant="outline" className="min-h-11 w-full sm:w-auto">이 세션 종료</Button>
                    </form>
                  ) : (
                    <p className="text-xs text-muted-foreground">현재 세션은 이 화면에서 종료할 수 없습니다. 로그아웃을 이용해 주세요.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-3" aria-labelledby="security-events">
        <SectionHeader id="security-events" eyebrow="SECURITY EVENTS" title="최근 보안 활동" />
        <Card><CardContent className="pt-6">
          {eventData === null ? <p className="text-sm text-muted-foreground">보안 활동을 불러오지 못했습니다.</p> : events.length === 0 ? <p className="text-sm text-muted-foreground">최근 보안 활동이 없습니다.</p> : (
            <ul className="grid gap-3">{events.map((event, index) => (
              <li key={`${event.createdAt}-${event.type}-${index}`} className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium">{SECURITY_EVENT_LABEL[event.type] ?? '계정 보안 활동'}</span>
                <span className="text-xs text-muted-foreground">{formatMoment(event.createdAt)}</span>
              </li>
            ))}</ul>
          )}
        </CardContent></Card>
      </section>

      {hasLocalIdentity ? (
        <Card>
          <CardHeader><CardTitle className="text-base">로그인 이메일 변경</CardTitle><CardDescription>최근 본인 확인 후 새 이메일로 확인 링크를 보냅니다. 링크를 확인하면 로그인 이메일이 바뀌고 모든 세션이 종료됩니다.</CardDescription></CardHeader>
          <CardContent><form action={requestLocalEmailChange} className="grid max-w-sm gap-2"><label htmlFor="new-login-email" className="text-sm font-medium">새 로그인 이메일</label><input id="new-login-email" name="email" type="email" autoComplete="email" maxLength={254} required className="min-h-11 rounded-md border bg-background px-3 text-base"/><Button type="submit" className="min-h-11">확인 이메일 보내기</Button></form></CardContent>
        </Card>
      ) : null}

      {hasLocalIdentity ? (
        <Card>
          <CardHeader><CardTitle className="text-base">비밀번호 변경</CardTitle><CardDescription>최근 본인 확인 후 새 비밀번호로 변경합니다. 변경하면 현재 세션을 제외한 다른 세션은 종료됩니다.</CardDescription></CardHeader>
          <CardContent><form action={changeLocalPassword} className="grid max-w-sm gap-2"><label htmlFor="new-password" className="text-sm font-medium">새 비밀번호</label><input id="new-password" name="password" type="password" autoComplete="new-password" maxLength={128} required className="min-h-11 rounded-md border bg-background px-3 text-base"/><label htmlFor="confirm-password" className="text-sm font-medium">새 비밀번호 확인</label><input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" maxLength={128} required className="min-h-11 rounded-md border bg-background px-3 text-base"/><Button type="submit" className="min-h-11">비밀번호 변경</Button></form></CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">다른 세션 전체 종료</CardTitle>
          <CardDescription>현재 브라우저 세션은 유지하고 나머지 활성 세션만 종료합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={terminateOtherSessions} className="w-full sm:w-auto">
            <Button type="submit" variant="destructive" disabled={otherCount === 0} className="min-h-11 w-full sm:w-auto">
              다른 세션 {otherCount}개 종료
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">모든 기기에서 로그아웃</CardTitle>
          <CardDescription>다른 활성 세션을 먼저 종료한 뒤 현재 브라우저에서도 로그아웃합니다. 최근 본인 확인이 필요합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={terminateAllSessions} className="w-full sm:w-auto">
            <Button type="submit" variant="destructive" className="min-h-11 w-full sm:w-auto">모든 기기에서 로그아웃</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">민감한 작업 본인 확인</CardTitle>
          <CardDescription>다른 세션 종료는 최근 본인 확인 후에만 허용됩니다. 연결된 이메일·비밀번호 또는 OAuth 로그인 수단으로 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {hasLocalIdentity ? (
            <form action={reauthenticateWithLocalPassword} className="grid w-full max-w-sm gap-2">
              <label htmlFor="reauth-email" className="text-sm font-medium">이메일</label>
              <input id="reauth-email" name="email" type="email" autoComplete="username" required className="min-h-11 rounded-md border bg-background px-3 text-base" />
              <label htmlFor="reauth-password" className="text-sm font-medium">비밀번호</label>
              <input id="reauth-password" name="password" type="password" autoComplete="current-password" required className="min-h-11 rounded-md border bg-background px-3 text-base" />
              <Button type="submit" variant="outline" className="min-h-11">이메일·비밀번호로 본인 확인</Button>
            </form>
          ) : null}
          {oauthIdentities.map((identity) => (
            <form action={beginSecurityReauthentication} key={identity.provider} className="w-full sm:w-auto">
              <input type="hidden" name="provider" value={identity.provider} />
              <Button type="submit" variant="outline" className="min-h-11 w-full sm:w-auto">
                {PROVIDER_NAME[identity.provider] ?? identity.provider}로 본인 확인
              </Button>
            </form>
          ))}
          {identities.length === 0 ? (
            <p className="text-sm text-muted-foreground">연결된 로그인 수단을 확인할 수 없습니다.</p>
          ) : null}
        </CardContent>
      </Card>

      <Button asChild variant="ghost" className="min-h-11 w-fit">
        <Link href="/account">내 계정으로 돌아가기</Link>
      </Button>
    </div>
  );
}
