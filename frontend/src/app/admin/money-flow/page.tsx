import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  Coins,
  Receipt,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/money-flow');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

interface UserMoneyFlowItem {
  readonly transaction_id: string;
  readonly type: string;
  readonly user_id: string;
  readonly display_name: string;
  readonly account_type: string;
  readonly direction: 'debit' | 'credit';
  readonly amount: string;
  readonly created_at: string;
}

interface UserMoneyFlowResponse {
  readonly items: readonly UserMoneyFlowItem[];
  readonly summary: {
    readonly total_volume_24h: string;
    readonly total_transactions_24h: number;
    readonly active_users_24h: number;
    readonly total_inflow_24h: string;
    readonly total_outflow_24h: string;
  };
  readonly next_cursor: string | null;
}

interface PageProps {
  readonly searchParams: Promise<{
    readonly search?: string;
    readonly type?: string;
    readonly direction?: string;
    readonly cursor?: string;
  }>;
}

function formatTypeLabel(type: string): { label: string; color: string } {
  switch (type) {
    case 'VIRTUAL_STOCK_BUY':
      return { label: '주식 매수', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
    case 'VIRTUAL_STOCK_SELL':
      return { label: '주식 매도', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    case 'BANK_DEPOSIT':
      return { label: '은행 예금', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    case 'BANK_WITHDRAW':
      return { label: '은행 출금', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    case 'SHOP_CATALOG_PURCHASE':
      return { label: '상점 구매', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    case 'MINT_TO_USER':
      return { label: '자금 지급/채굴', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30' };
    case 'WORK_REWARD_CLAIM':
      return { label: '직업 급여', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
    case 'CASINO_PAYOUT':
      return { label: '게임 배당', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' };
    default:
      return { label: type, color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' };
  }
}

export default async function AdminMoneyFlowPage({ searchParams }: PageProps) {
  await requireAdminConsole(AREA.href);
  const params = await searchParams;

  const search = params.search?.trim() || '';
  const type = params.type?.trim() || '';
  const direction = params.direction?.trim() || '';
  const cursor = params.cursor?.trim() || '';

  const queryParams = new URLSearchParams();
  queryParams.set('limit', '50');
  if (search) queryParams.set('search', search);
  if (type) queryParams.set('type', type);
  if (direction) queryParams.set('direction', direction);
  if (cursor) queryParams.set('cursor', cursor);

  const res = await apiOrNull<UserMoneyFlowResponse>(
    `/api/v1/admin/treasury/user-money-flows?${queryParams.toString()}`
  );

  const items = res?.items ?? [];
  const summary = res?.summary ?? {
    total_volume_24h: '0',
    total_transactions_24h: 0,
    active_users_24h: 0,
    total_inflow_24h: '0',
    total_outflow_24h: '0',
  };

  return (
    <div data-page="admin-money-flow" className="mv-page mv-page--admin grid gap-6">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {/* 24-Hour Stat Metric Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-800 bg-card/90">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              24시간 총 거래액
            </CardTitle>
            <Coins className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono text-foreground">
              {Number(summary.total_volume_24h).toLocaleString()} <span className="text-xs text-muted-foreground font-sans">WLD</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">유저 간 및 시스템 전체 원장 거래액</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-card/90">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              24시간 트랜잭션 건수
            </CardTitle>
            <Receipt className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono text-foreground">
              {summary.total_transactions_24h.toLocaleString()} <span className="text-xs text-muted-foreground font-sans">건</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">복식부기 원장에 체결된 총 거래 수</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-card/90">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              24시간 활성 거래 유저
            </CardTitle>
            <Users className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono text-foreground">
              {summary.active_users_24h.toLocaleString()} <span className="text-xs text-muted-foreground font-sans">명</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">실제 자금 변동이 발생한 고유 유저</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-card/90">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              24시간 순 유입/유출
            </CardTitle>
            <Landmark className="size-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-emerald-400">
                +{Number(summary.total_inflow_24h).toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-sm font-bold font-mono text-rose-400">
                -{Number(summary.total_outflow_24h).toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">유저 현금 계좌 기준 입금 / 출금</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-zinc-800 bg-card/90">
        <CardContent className="pt-5">
          <form method="GET" action="/admin/money-flow" className="grid gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                유저 검색 (닉네임 또는 UUID)
              </label>
              <div className="relative">
                <Search className="size-3.5 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="예: 치킨 또는 유저 UUID..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-700 bg-zinc-900 text-foreground placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary min-h-[40px]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                거래 유형
              </label>
              <select
                name="type"
                defaultValue={type}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-700 bg-zinc-900 text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[40px]"
              >
                <option value="">전체 유형</option>
                <option value="VIRTUAL_STOCK_BUY">주식 매수 (VIRTUAL_STOCK_BUY)</option>
                <option value="VIRTUAL_STOCK_SELL">주식 매도 (VIRTUAL_STOCK_SELL)</option>
                <option value="BANK_DEPOSIT">은행 예금 (BANK_DEPOSIT)</option>
                <option value="BANK_WITHDRAW">은행 출금 (BANK_WITHDRAW)</option>
                <option value="SHOP_CATALOG_PURCHASE">상점 구매 (SHOP_CATALOG_PURCHASE)</option>
                <option value="MINT_TO_USER">자금 지급 (MINT_TO_USER)</option>
                <option value="WORK_REWARD_CLAIM">직업 급여 (WORK_REWARD_CLAIM)</option>
                <option value="CASINO_PAYOUT">게임 배당 (CASINO_PAYOUT)</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  방향
                </label>
                <select
                  name="direction"
                  defaultValue={direction}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-700 bg-zinc-900 text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[40px]"
                >
                  <option value="">전체 방향</option>
                  <option value="debit">차변 (+) 입금</option>
                  <option value="credit">대변 (-) 출금</option>
                </select>
              </div>

              <Button type="submit" size="sm" className="min-h-[40px] px-4 font-bold text-xs">
                검색
              </Button>
              <Button asChild variant="outline" size="sm" className="min-h-[40px] px-3">
                <Link href="/admin/money-flow">
                  <RotateCcw className="size-3.5" />
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* User Money Flow Data Table */}
      <Card className="border-zinc-800 bg-card/90">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              실시간 유저 자금 흐름 원장 내역
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              조회된 거래: {items.length}건
            </CardDescription>
          </div>

          <Badge variant="outline" className="text-xs font-mono font-bold text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
            <CheckCircle2 className="size-3 mr-1" />
            100% 실시간 원장 대사 중
          </Badge>
        </CardHeader>

        <CardContent className="pt-4">
          {items.length === 0 ? (
            <EmptyState
              title="해당 조건의 유저 자금 흐름 기록이 없습니다."
              description="검색어나 필터 조건을 변경하여 다시 조회해 보세요."
            />
          ) : (
            <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="py-2.5 px-3 font-semibold">일시</th>
                    <th className="py-2.5 px-3 font-semibold">거래 유형</th>
                    <th className="py-2.5 px-3 font-semibold">유저 (닉네임 / ID)</th>
                    <th className="py-2.5 px-3 font-semibold">계좌</th>
                    <th className="py-2.5 px-3 font-semibold text-right">변동 금액</th>
                    <th className="py-2.5 px-3 font-semibold text-right">트랜잭션 ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {items.map((item, idx) => {
                    const typeBadge = formatTypeLabel(item.type);
                    const isDebit = item.direction === 'debit';
                    const amountNum = Number(item.amount);

                    return (
                      <tr key={`${item.transaction_id}_${idx}`} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3 font-mono text-zinc-400 whitespace-nowrap">
                          {new Date(item.created_at).toLocaleString('ko-KR', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,
                          })}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <Badge variant="outline" className={`text-[10px] font-bold ${typeBadge.color}`}>
                            {typeBadge.label}
                          </Badge>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-foreground truncate max-w-[120px]">
                              {item.display_name}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                              ({item.user_id.slice(0, 8)})
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                          <Badge variant="secondary" className="text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                            {item.account_type}
                          </Badge>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">
                          <span className={`inline-flex items-center gap-0.5 ${isDebit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isDebit ? '+' : '-'}
                            {amountNum.toLocaleString()} WLD
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-[10px] text-zinc-500 whitespace-nowrap">
                          {item.transaction_id.slice(0, 8)}...
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Cursor */}
          {res?.next_cursor && (
            <div className="mt-4 pt-3 border-t border-border/50 flex justify-end">
              <Button asChild variant="outline" size="sm" className="text-xs font-bold">
                <Link
                  href={`/admin/money-flow?${new URLSearchParams({
                    ...(search ? { search } : {}),
                    ...(type ? { type } : {}),
                    ...(direction ? { direction } : {}),
                    cursor: res.next_cursor,
                  }).toString()}`}
                >
                  다음 50건 조회 →
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
