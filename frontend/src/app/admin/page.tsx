import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CircleAlert, CircleCheck } from 'lucide-react';
import { PageHeader, SectionHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { adminConsole } from '@/lib/session';
import { ADMIN_AREAS } from './areas';
import { CloseConsole, EnrolSecondFactor, IssueRecoveryCodes, OpenConsole } from './console-gate';
import type {
  AdminBusiness,
  AdminConsole,
  AdminSeasonEvent,
  AdminStock,
  AdminUser,
  FeatureSwitch,
  ReconciliationHealth,
} from './types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '운영',
  robots: { index: false, follow: false },
};

/**
 * The console's front door, and now its door.
 *
 * Reaching the administrator surface used to need only a role. Since
 * two-person approval was retired it needs a console session: a rotated
 * session with a thirty-minute life and a ten-minute idle lock, opened by
 * proving the OAuth identity again and spending a code from an authenticator
 * app. This page is the only screen that renders without one, because it is
 * where one is obtained — every other area redirects here.
 *
 * The map below is unchanged in shape: what needs attention now, and every
 * place there is to go, with a count so the console says how much is behind
 * each door rather than making the operator open it to find out.
 */
export default async function AdminPage() {
  const admin = await adminConsole();
  if (admin.consoleSession.state !== 'open') return <Gate admin={admin} />;

  // Counts only. Each area page fetches its own rows, so opening one is one
  // request rather than eight.
  const [controls, users, stocks, businesses, events, health] = await Promise.all([
    apiOrNull<{ featureSwitches: FeatureSwitch[] }>('/api/v1/admin/controls'),
    apiOrNull<{ users: AdminUser[] }>('/api/v1/admin/users'),
    apiOrNull<{ stocks: AdminStock[] }>('/api/v1/admin/stocks'),
    apiOrNull<{ businessTypes: AdminBusiness[] }>('/api/v1/admin/business-types'),
    apiOrNull<{ events: AdminSeasonEvent[] }>('/api/v1/admin/season-events'),
    apiOrNull<ReconciliationHealth>('/api/v1/admin/economy/reconciliations/latest'),
  ]);

  const held =
    controls?.featureSwitches.filter((feature) => feature.state !== 'enabled').length ?? 0;
  const integrityOk = health?.integrity?.ok;

  const counts: Readonly<Record<string, string | null>> = {
    '/admin/controls': controls
      ? `기능 ${controls.featureSwitches.length}개 · 중지·안전모드 ${held}개`
      : null,
    '/admin/users': users ? `${users.users.length}명` : null,
    '/admin/market': stocks ? `종목 ${stocks.stocks.length}개` : null,
    '/admin/catalog':
      businesses && events
        ? `사업 ${businesses.businessTypes.length}개 · 이벤트 ${events.events.length}개`
        : null,
    '/admin/economy': health?.available ? '최근 스냅샷 있음' : '스냅샷 없음',
    // No count for these four. Each would be another round trip on the one
    // screen that is supposed to open fast, and the card already says what is
    // behind the door.
    '/admin/work': null,
    '/admin/bank': null,
    '/admin/discord': null,
    '/admin/logs': null,
    '/admin/logs/integrity': null,
    '/admin/content': null,
  };

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="WOLDEOK MONEYVERSE · OPERATIONS" title="운영 콘솔">
        모든 작업은 감사 기록에 남고, 데이터베이스가 역할을 다시 확인합니다. 이 화면은 무엇을 보여
        줄지만 정하고, 무엇을 허용할지는 정하지 않습니다.
      </PageHeader>

      {/* Two things an operator should not have to open a page to learn: is
          anything switched off, and does the ledger still balance. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Attention
          tone={held > 0 ? 'attention' : 'calm'}
          term="중지·안전모드인 기능"
          value={controls === null ? '확인할 수 없음' : `${held}개`}
          href="/admin/controls"
        />
        <Attention
          tone={integrityOk === false ? 'attention' : 'calm'}
          term="원장 정합성"
          value={
            health?.available !== true ? '스냅샷 없음' : integrityOk ? '이상 없음' : '불일치 발견'
          }
          href="/admin/economy"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">내 운영 역할과 콘솔 세션</CardTitle>
          <CardDescription>
            표시된 역할은 이 세션에서 서버가 확인한 권한입니다. 허용 여부는 데이터베이스가 매
            요청마다 다시 판단합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            {admin.roles.map((role) => (
              <Badge key={role} variant={role === 'superadmin' ? 'default' : 'secondary'}>
                {role}
              </Badge>
            ))}
          </div>
          <dl className="grid gap-1 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">콘솔 만료</dt>
              <dd className="tabular">
                {admin.consoleSession.expiresAt
                  ? formatMoment(admin.consoleSession.expiresAt)
                  : '—'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">유휴 잠금</dt>
              <dd className="tabular">
                {admin.consoleSession.idleExpiresAt
                  ? formatMoment(admin.consoleSession.idleExpiresAt)
                  : '—'}
              </dd>
            </div>
          </dl>
          <CloseConsole />
          {admin.roles.includes('superadmin') && <IssueRecoveryCodes />}
        </CardContent>
      </Card>

      <section aria-labelledby="admin-areas-title" className="grid gap-3">
        <SectionHeader eyebrow="CONSOLE" title="관리 영역" id="admin-areas-title" />
        <div className="grid gap-3 md:grid-cols-2">
          {ADMIN_AREAS.map((area) => (
            <Link
              key={area.href}
              href={area.href}
              className="group flex min-h-24 flex-col justify-between gap-2 rounded-[14px] border bg-surface p-4 shadow-plate transition-transform hover:-translate-y-0.5"
            >
              <span>
                <span className="eyebrow">{area.eyebrow}</span>
                <span className="mt-1.5 flex items-center gap-2">
                  <b className="text-lg">{area.title}</b>
                  <ArrowRight className="size-4 shrink-0 text-clay transition-transform group-hover:translate-x-1" />
                </span>
              </span>
              <span className="grid gap-1">
                <span className="text-sm text-muted-foreground [word-break:keep-all]">
                  {area.summary}
                </span>
                {counts[area.href] && (
                  <span className="text-xs font-bold text-clay-ink">{counts[area.href]}</span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * What an administrator sees before the console is open.
 *
 * Deliberately a page rather than a redirect to a separate route: there is
 * nothing else at /admin worth showing without a console session, and one
 * screen that names the missing step is easier to follow than a bounce
 * through a second URL.
 */
function Gate({ admin }: { readonly admin: AdminConsole }) {
  const locked = admin.consoleSession.state === 'idle_locked';
  const expired = admin.consoleSession.state === 'expired';

  return (
    <div className="grid gap-5">
      <PageHeader eyebrow="WOLDEOK MONEYVERSE · OPERATIONS" title="운영 콘솔 잠금">
        운영 기능은 별도의 콘솔 세션에서만 열립니다. 본인 확인을 다시 하고 인증 앱 코드를 입력해야
        들어갈 수 있습니다.
      </PageHeader>

      {(locked || expired) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {locked ? '조작이 없어 잠겼어요.' : '콘솔 세션이 만료됐어요.'}
            </CardTitle>
            <CardDescription>
              아래에서 다시 열 수 있습니다. 잠기기 전에 하던 변경은 저장되지 않습니다.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!admin.available ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2단계 인증이 준비되지 않았어요.</CardTitle>
            <CardDescription>
              이 배포에는 인증 키가 설정되어 있지 않습니다. 운영자에게 문의해 주세요.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !admin.secondFactor.confirmed ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">인증 앱을 먼저 등록해 주세요.</CardTitle>
            <CardDescription>
              최고관리자 한 명이 모든 운영 기능을 단독으로 실행하므로, 로그인 외에 두 번째 인증
              수단이 반드시 필요합니다. 등록에는 최근 5분 안의 본인 확인이 필요합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {/* Shown only while it is the thing standing in the way. An
                operator who has just confirmed their identity was still being
                told to go and confirm it -- and the control below was live
                whether or not they had, so pressing it answered 401. */}
            {!admin.reauthentication.fresh && (
              <Button asChild variant="outline" className="min-h-11 w-fit">
                <Link href="/account">본인 확인하러 가기 →</Link>
              </Button>
            )}
            <EnrolSecondFactor disabled={!admin.reauthentication.fresh} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">콘솔 열기</CardTitle>
            <CardDescription>
              최근 5분 안에 본인 확인을 마쳤고, 등록된 기기·주소에서 접속한 경우에만 열립니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {!admin.reauthentication.fresh && (
              <Button asChild variant="outline" className="min-h-11 w-fit">
                <Link href="/account">본인 확인하러 가기 →</Link>
              </Button>
            )}
            <OpenConsole disabled={!admin.reauthentication.fresh} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Attention({
  tone,
  term,
  value,
  href,
}: {
  readonly tone: 'attention' | 'calm';
  readonly term: string;
  readonly value: string;
  readonly href: string;
}) {
  const attention = tone === 'attention';
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-[14px] border p-4 shadow-plate transition-transform hover:-translate-y-0.5 ${
        attention ? 'border-clay bg-clay-soft/30' : 'bg-surface'
      }`}
    >
      {attention ? (
        <CircleAlert className="size-5 shrink-0 text-clay" />
      ) : (
        <CircleCheck className="size-5 shrink-0 text-primary" />
      )}
      <span className="grid gap-0.5">
        <span className="text-xs text-muted-foreground">{term}</span>
        <b className="text-lg">{value}</b>
      </span>
      <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
