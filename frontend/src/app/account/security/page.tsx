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
  terminateSession,
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
}

interface Identity {
  readonly provider: string;
}

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
  const [sessionData, identityData] = await Promise.all([
    apiOrNull<{ sessions: SecuritySession[] }>('/api/v1/account/security/sessions'),
    apiOrNull<{ identities: Identity[] }>('/api/v1/account/identities'),
  ]);
  const sessions = sessionData?.sessions ?? [];
  const identities = identityData?.identities ?? [];
  const otherCount = sessions.filter((session) => !session.current).length;
  const error = typeof params.error === 'string' ? params.error : null;
  const revoked = typeof params.revoked === 'string' ? params.revoked : null;

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="ACCOUNT SECURITY" title="계정 보안 센터">
        로그인 중인 세션을 확인하고, 사용하지 않는 다른 세션을 종료할 수 있습니다.
      </PageHeader>

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
                      {session.current ? '현재 세션' : '다른 로그인 세션'}
                    </CardTitle>
                    {session.current ? <Badge>현재 사용 중</Badge> : <Badge variant="secondary">다른 세션</Badge>}
                    {session.administratorSession ? <Badge variant="outline">운영 콘솔 사용 이력</Badge> : null}
                  </div>
                  <CardDescription>
                    생성 {formatMoment(session.createdAt)} · 만료 {formatMoment(session.expiresAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <div className="text-muted-foreground">
                    최근 본인 확인: {session.reauthenticatedAt ? formatMoment(session.reauthenticatedAt) : '기록 없음'}
                  </div>
                  {!session.current ? (
                    <form action={terminateSession}>
                      <input type="hidden" name="sessionId" value={session.sessionId} />
                      <Button type="submit" variant="outline">이 세션 종료</Button>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">다른 세션 전체 종료</CardTitle>
          <CardDescription>현재 브라우저 세션은 유지하고 나머지 활성 세션만 종료합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={terminateOtherSessions}>
            <Button type="submit" variant="destructive" disabled={otherCount === 0}>
              다른 세션 {otherCount}개 종료
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">민감한 작업 본인 확인</CardTitle>
          <CardDescription>다른 세션 종료는 최근 OAuth 본인 확인 후에만 허용됩니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {identities.map((identity) => (
            <form action={beginSecurityReauthentication} key={identity.provider}>
              <input type="hidden" name="provider" value={identity.provider} />
              <Button type="submit" variant="outline">
                {PROVIDER_NAME[identity.provider] ?? identity.provider}로 본인 확인
              </Button>
            </form>
          ))}
          {identities.length === 0 ? (
            <p className="text-sm text-muted-foreground">연결된 로그인 수단을 확인할 수 없습니다.</p>
          ) : null}
        </CardContent>
      </Card>

      <Button asChild variant="ghost" className="w-fit">
        <Link href="/account">내 계정으로 돌아가기</Link>
      </Button>
    </div>
  );
}
