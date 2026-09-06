import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, CircleAlert, CircleCheck } from 'lucide-react';
import { PageHeader, SectionHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { adminConsole } from '@/lib/session';
import { ADMIN_AREAS, adminAreaFor, consoleReturnPath } from './areas';
import { AdminQuickUserSearch } from './admin-quick-search';
import { CloseConsole, IssueRecoveryCodes, OpenConsole } from './console-gate';
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

const AREA_GROUPS = [
  {
    key: 'safety',
    eyebrow: 'MEMBERS AND PUBLISHING',
    title: '회원 · 공개 콘텐츠',
    description: '사용자 안전 조치와 외부에 공개되는 콘텐츠를 관리합니다.',
  },
  {
    key: 'economy',
    eyebrow: 'ECONOMY OPERATIONS',
    title: '경제 · 게임 운영',
    description: '서비스 기능과 가상경제에 직접 영향을 주는 운영 영역입니다.',
  },
  {
    key: 'records',
    eyebrow: 'AUDIT AND DELIVERY',
    title: '감사 · 전달 기록',
    description: '관리 작업의 근거와 외부 전달 상태를 추적합니다.',
  },
] as const;

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
export default async function AdminPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await adminConsole();
  // The page whose gate sent the operator here, when one did. Checked rather
  // than trusted: it is a query parameter.
  const params = await searchParams;
  const next = consoleReturnPath(params.next);
  if (admin.consoleSession.state !== 'open') return <Gate admin={admin} next={next} />;
  // Already open -- in another tab, or here before a reload -- and still
  // carrying the page that was refused. Finish the journey it started.
  if (next) redirect(next);

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

  const topUsers = (users?.users ?? [])
    .slice()
    .sort((a, b) => (Number(b.total_net_worth) || 0) - (Number(a.total_net_worth) || 0))
    .slice(0, 5);

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
    '/admin/logs/delivery': null,
    '/admin/logs/integrity': null,
    '/admin/content': null,
  };

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="WOLDEOK MONEYVERSE · OPERATIONS" title="운영 콘솔">
        모든 작업은 감사 기록에 남고, 데이터베이스가 역할을 다시 확인합니다. 이 화면은 무엇을 보여
        줄지만 정하고, 무엇을 허용할지는 정하지 않습니다.
      </PageHeader>

      {/* 회원 원클릭 빠른 검색 폼 */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span className="text-primary">⚡</span>
                <span>회원 빠른 검색 및 제재/자산 관리</span>
              </CardTitle>
              <CardDescription>
                회원 UUID를 입력하면 해당 회원의 자산, 활동 이력, 이용 제한(정지), 관리자 자산 지급/회수 화면으로 즉시 이동합니다.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users">전체 회원 목록 →</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AdminQuickUserSearch />
        </CardContent>
      </Card>

      {/* 실시간 최고 부자 TOP 5 리치 리스트 위젯 */}
      {topUsers.length > 0 && (
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <span className="text-amber-500">👑</span>
                  <span>실시간 최고 부자 TOP 5 (Rich List)</span>
                </CardTitle>
                <CardDescription>
                  머니버스 내 현금, 예금, 국채, 주식 자산 합계 기준 상위 고액 자산가 실시간 랭킹입니다.
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                <Link href="/admin/users">부자 순위 및 전체 자산 관리 →</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
              {topUsers.map((u, idx) => {
                const rank = idx + 1;
                const netWorth = Number(u.total_net_worth ?? 0);
                const cash = Number(u.cash_balance ?? 0);
                const stock = Number(u.stock_eval ?? 0);
                return (
                  <Link
                    key={u.user_id}
                    href={`/admin/users/${encodeURIComponent(u.user_id)}`}
                    className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-3.5 hover:border-amber-500/40 hover:bg-muted/30 transition-all shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className={`inline-flex items-center justify-center font-bold text-xs size-6 rounded-full ${
                          rank === 1 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40' :
                          rank === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40' :
                          rank === 3 ? 'bg-amber-800/20 text-amber-600 border border-amber-700/40' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                        </span>
                        <span className="font-mono text-[0.68rem] text-muted-foreground truncate max-w-20">
                          {u.user_id.slice(0, 8)}…
                        </span>
                      </div>
                      <div className="mt-2 font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {u.display_name}
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-border/40">
                      <div className="text-[0.7rem] text-muted-foreground">총 순자산</div>
                      <div className="font-mono font-bold text-sm text-primary">
                        {netWorth.toLocaleString()} <span className="text-[0.65rem] font-normal text-muted-foreground">WLD</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[0.65rem] text-muted-foreground">
                        <span>현금 {cash.toLocaleString()}</span>
                        {stock > 0 && <span>주식 {stock.toLocaleString()}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 핵심 기능 스위치 실시간 상태 카드 */}
      {controls && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base font-bold">핵심 시스템 기능 스위치 현황</CardTitle>
                <CardDescription>
                  서비스 내 실시간 주요 기능 활성화 상태입니다.
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/controls">스위치 제어판 →</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {controls.featureSwitches.slice(0, 8).map((fs) => (
                <div
                  key={fs.feature_key}
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-surface/40 p-2.5 text-xs"
                >
                  <span className="font-medium text-foreground truncate mr-2">{fs.title || fs.feature_key}</span>
                  <Badge
                    variant={
                      fs.state === 'enabled'
                        ? 'default'
                        : fs.state === 'safe_mode'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className="text-[10px] uppercase font-bold"
                  >
                    {fs.state}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      <section aria-labelledby="admin-areas-title" className="grid gap-6">
        <SectionHeader eyebrow="CONSOLE" title="관리 영역" id="admin-areas-title" />
        {AREA_GROUPS.map((group) => {
          const areas = ADMIN_AREAS.filter((area) => area.group === group.key);
          return (
            <div key={group.key} className="grid gap-3">
              <div className="grid gap-1">
                <span className="eyebrow">{group.eyebrow}</span>
                <h3 className="text-lg font-bold">{group.title}</h3>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {areas.map((area) => (
                  <Link
                    key={area.href}
                    href={area.href}
                    className="group flex min-h-36 flex-col justify-between gap-4 rounded-2xl border bg-surface p-5 shadow-plate transition-[transform,border-color,box-shadow] hover:-translate-y-1 hover:border-clay/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="eyebrow">{area.eyebrow}</span>
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-clay-soft/60 text-clay transition-transform group-hover:translate-x-0.5">
                        <ArrowRight className="size-4" />
                      </span>
                    </span>
                    <span className="grid gap-1.5">
                      <b className="text-lg">{area.title}</b>
                      <span className="text-sm text-muted-foreground [word-break:keep-all]">
                        {area.summary}
                      </span>
                      {counts[area.href] && (
                        <span className="mt-1 text-xs font-bold text-clay-ink">
                          {counts[area.href]}
                        </span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
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
function Gate({ admin, next }: { readonly admin: AdminConsole; readonly next: string | null }) {
  const locked = admin.consoleSession.state === 'idle_locked';
  const expired = admin.consoleSession.state === 'expired';
  // The screen that turned the operator away, named by its own title so the
  // sentence below matches the menu item they clicked.
  const waiting = next ? (adminAreaFor(next)?.title ?? next) : null;

  return (
    <div className="grid gap-5">
      <PageHeader eyebrow="WOLDEOK MONEYVERSE · OPERATIONS" title="운영 콘솔 잠금">
        운영 기능은 별도의 콘솔 세션에서만 열립니다. 현재 로그인 세션의 관리자 역할을 확인한 뒤
        들어갈 수 있습니다.
      </PageHeader>

      {/* Why they are here rather than on the page they clicked. Without this
          the bounce from 경제 to /admin read as the economy page being broken,
          and nothing on either screen said otherwise. */}
      {waiting && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">‘{waiting}’ 화면은 콘솔을 연 뒤에 열립니다.</CardTitle>
            <CardDescription>
              아래에서 콘솔을 열면 그 화면으로 바로 돌아갑니다.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

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
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">콘솔 열기</CardTitle>
            <CardDescription>
              현재 로그인한 계정에 관리자 역할이 있고 허용된 주소에서 접속한 경우에만 열립니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <OpenConsole next={next} />
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
