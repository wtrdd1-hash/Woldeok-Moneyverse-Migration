import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CircleAlert, CircleCheck } from 'lucide-react';
import { PageHeader, SectionHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { requireAdministrator } from '@/lib/session';
import { ADMIN_AREAS } from './areas';
import type {
  AdminBusiness,
  AdminSeasonEvent,
  AdminStock,
  AdminUser,
  ApprovalRequest,
  ReconciliationHealth,
} from './types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '운영',
  robots: { index: false, follow: false },
};

/**
 * The console's front door.
 *
 * It used to be the whole console: one page, eight endpoints, five tabs, and
 * four fifths of what an operator could do hidden behind a tab they had to
 * think to press. The original stacked every panel on one screen, so the port
 * had made the surface look smaller than it is.
 *
 * Now each area is a page, and this is the map: what needs attention right
 * now, and every place there is to go, with a count so the console says how
 * much is behind each door rather than making the operator open it to find
 * out.
 */
export default async function AdminPage() {
  const roles = await requireAdministrator();

  // Counts only. Each area page fetches its own rows, so opening one is one
  // request rather than eight.
  const [approvals, users, stocks, businesses, events, health] = await Promise.all([
    apiOrNull<{ approvals: ApprovalRequest[] }>('/api/v1/admin/approvals'),
    apiOrNull<{ users: AdminUser[] }>('/api/v1/admin/users'),
    apiOrNull<{ stocks: AdminStock[] }>('/api/v1/admin/stocks'),
    apiOrNull<{ businessTypes: AdminBusiness[] }>('/api/v1/admin/business-types'),
    apiOrNull<{ events: AdminSeasonEvent[] }>('/api/v1/admin/season-events'),
    apiOrNull<ReconciliationHealth>('/api/v1/admin/economy/reconciliations/latest'),
  ]);

  const pending = approvals?.approvals.filter((row) => row.status === 'pending').length ?? 0;
  const integrityOk = health?.integrity?.ok;

  const counts: Readonly<Record<string, string | null>> = {
    '/admin/approvals': approvals ? `대기 ${pending}건 · 전체 ${approvals.approvals.length}건` : null,
    '/admin/users': users ? `${users.users.length}명` : null,
    '/admin/market': stocks ? `종목 ${stocks.stocks.length}개` : null,
    '/admin/catalog': businesses && events
      ? `사업 ${businesses.businessTypes.length}개 · 이벤트 ${events.events.length}개`
      : null,
    '/admin/economy': health?.available ? '최근 스냅샷 있음' : '스냅샷 없음',
    '/admin/logs': null,
    '/admin/content': null,
  };

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="WOLDEOK MONEYVERSE · OPERATIONS" title="운영 승인 콘솔">
        모든 작업은 감사 기록에 남고, 데이터베이스가 역할을 다시 확인합니다. 이 화면은 무엇을
        보여 줄지만 정하고, 무엇을 허용할지는 정하지 않습니다.
      </PageHeader>

      {/* Two things an operator should not have to open a page to learn: is
          anything waiting for a decision, and does the ledger still balance. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Attention
          tone={pending > 0 ? 'attention' : 'calm'}
          term="결정을 기다리는 요청"
          value={approvals === null ? '확인할 수 없음' : `${pending}건`}
          href="/admin/approvals"
        />
        <Attention
          tone={integrityOk === false ? 'attention' : 'calm'}
          term="원장 정합성"
          value={
            health?.available !== true
              ? '스냅샷 없음'
              : integrityOk
                ? '이상 없음'
                : '불일치 발견'
          }
          href="/admin/economy"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">내 운영 역할</CardTitle>
          <CardDescription>
            표시된 역할은 이 세션에서 서버가 확인한 권한입니다. 허용 여부는 데이터베이스가 매
            요청마다 다시 판단합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <Badge key={role} variant="secondary">
              {role}
            </Badge>
          ))}
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
                  <span className="text-xs font-bold text-clay">{counts[area.href]}</span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </section>
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
        <CircleCheck className="size-5 shrink-0 text-forest" />
      )}
      <span className="grid gap-0.5">
        <span className="text-xs text-muted-foreground">{term}</span>
        <b className="text-lg">{value}</b>
      </span>
      <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
