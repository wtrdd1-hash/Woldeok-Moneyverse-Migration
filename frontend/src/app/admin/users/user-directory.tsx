'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Coins,
  Crown,
  Landmark,
  PiggyBank,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
  Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { compareAmounts, groupDigits } from '@/lib/money';
import type { AdminUser } from '../types';

type StatusFilter = 'all' | 'active' | 'restricted';
type SortOption = 'wealth' | 'cash' | 'stock' | 'created';

function accessTime(value: string | null | undefined): string {
  if (!value) return '기록 없음';
  return new Date(value).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function UserDirectory({ users }: { readonly users: readonly AdminUser[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortOption>('wealth');

  const restrictedCount = users.filter((user) => user.restricted_at !== null).length;
  const activeCount = users.length - restrictedCount;

  // Total wealth across all members
  const totalNetWorth = useMemo(() => {
    return users.reduce((sum, u) => sum + BigInt(u.total_net_worth ?? '0'), 0n).toString();
  }, [users]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ko-KR');

    return users
      .filter((user) => {
        if (status === 'active' && user.restricted_at !== null) return false;
        if (status === 'restricted' && user.restricted_at === null) return false;
        if (!needle) return true;

        const name = (user.display_name ?? '').toLocaleLowerCase('ko-KR');
        const id = (user.user_id ?? '').toLowerCase();
        return name.includes(needle) || id.includes(needle);
      })
      .sort((a, b) => {
        if (sort === 'wealth') {
          const order = compareAmounts(b.total_net_worth ?? '0', a.total_net_worth ?? '0');
          if (order !== 0) return order;
          return a.display_name.localeCompare(b.display_name, 'ko-KR');
        }
        if (sort === 'cash') {
          const order = compareAmounts(b.cash_balance ?? '0', a.cash_balance ?? '0');
          if (order !== 0) return order;
          return a.display_name.localeCompare(b.display_name, 'ko-KR');
        }
        if (sort === 'stock') {
          const order = compareAmounts(b.stock_eval ?? '0', a.stock_eval ?? '0');
          if (order !== 0) return order;
          return a.display_name.localeCompare(b.display_name, 'ko-KR');
        }
        // created
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [users, query, status, sort]);

  return (
    <div className="grid gap-6">
      {/* 상단 통계 요약 카드 4종 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* 전체 회원 수 */}
        <Card className="border-border shadow-xs">
          <CardContent className="flex items-center gap-3.5 py-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <UsersRound className="size-5" />
            </span>
            <div className="grid gap-0.5">
              <span className="text-xs text-muted-foreground font-medium">전체 회원</span>
              <strong className="text-2xl font-bold tracking-tight">{users.length}명</strong>
            </div>
          </CardContent>
        </Card>

        {/* 정상 이용 회원 */}
        <Card className="border-border shadow-xs">
          <CardContent className="flex items-center gap-3.5 py-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <UserRoundCheck className="size-5" />
            </span>
            <div className="grid gap-0.5">
              <span className="text-xs text-muted-foreground font-medium">정상 이용</span>
              <strong className="text-2xl font-bold tracking-tight">{activeCount}명</strong>
            </div>
          </CardContent>
        </Card>

        {/* 이용 제한 회원 */}
        <Card className={restrictedCount > 0 ? 'border-destructive/30 bg-destructive/5 shadow-xs' : 'border-border shadow-xs'}>
          <CardContent className="flex items-center gap-3.5 py-4">
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${restrictedCount > 0 ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}>
              <ShieldAlert className="size-5" />
            </span>
            <div className="grid gap-0.5">
              <span className="text-xs text-muted-foreground font-medium">이용 제한</span>
              <strong className={`text-2xl font-bold tracking-tight ${restrictedCount > 0 ? 'text-destructive' : ''}`}>
                {restrictedCount}명
              </strong>
            </div>
          </CardContent>
        </Card>

        {/* 회원 총 순자산 합계 */}
        <Card className="border-border shadow-xs">
          <CardContent className="flex items-center gap-3.5 py-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
              <Coins className="size-5" />
            </span>
            <div className="grid gap-0.5">
              <span className="text-xs text-muted-foreground font-medium">전체 회원 총 순자산</span>
              <strong className="text-xl font-bold tracking-tight font-mono text-amber-600 dark:text-amber-400">
                {groupDigits(totalNetWorth)}
                <span className="text-xs font-normal text-muted-foreground ml-1">WLD</span>
              </strong>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 부자 랭킹 및 회원 관리 메인 카드 */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Crown className="size-4 text-amber-500" /> 회원 부자 순위(Leaderboard) 및 자산 관리
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                회원별 현금(지갑), 예금, 국채, 주식 평가액을 합산한 총 순자산 랭킹과 상세 자산을 확인하고 즉시 관리합니다.
              </p>
            </div>

            {/* 정렬 옵션 탭 */}
            <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-lg border text-xs">
              <span className="text-[0.7rem] font-bold text-muted-foreground px-2 flex items-center gap-1">
                <SlidersHorizontal className="size-3" /> 정렬:
              </span>
              <Button
                type="button"
                size="xs"
                variant={sort === 'wealth' ? 'default' : 'ghost'}
                onClick={() => setSort('wealth')}
                className="h-7 text-xs font-medium"
              >
                🏆 부자 순위 순
              </Button>
              <Button
                type="button"
                size="xs"
                variant={sort === 'cash' ? 'default' : 'ghost'}
                onClick={() => setSort('cash')}
                className="h-7 text-xs font-medium"
              >
                💵 현금 많은 순
              </Button>
              <Button
                type="button"
                size="xs"
                variant={sort === 'stock' ? 'default' : 'ghost'}
                onClick={() => setSort('stock')}
                className="h-7 text-xs font-medium"
              >
                📈 주식 자산 순
              </Button>
              <Button
                type="button"
                size="xs"
                variant={sort === 'created' ? 'default' : 'ghost'}
                onClick={() => setSort('created')}
                className="h-7 text-xs font-medium"
              >
                📅 최근 가입 순
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 pt-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <span className="sr-only">사용자 검색</span>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="닉네임 또는 사용자 UUID 검색..."
                className="h-10 pl-9 text-sm"
              />
            </label>

            <div className="flex flex-wrap gap-1.5" role="group" aria-label="사용자 상태 필터">
              {([
                ['all', '전체'],
                ['active', '정상'],
                ['restricted', '제한됨'],
              ] as const).map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={status === value ? 'default' : 'outline'}
                  onClick={() => setStatus(value)}
                  aria-pressed={status === value}
                  className="h-9 text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-start justify-between gap-3 text-xs text-muted-foreground">
            <span>
              조회 조건에 맞는 회원 <strong className="text-foreground">{filtered.length}명</strong>
            </span>
            <span className="hidden text-right text-[0.72rem] sm:block">
              순자산 = 지갑 현금 + 은행 예금 + 활성 국채 + 주식 실시간 평가액
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-xl border border-dashed p-10 text-center text-muted-foreground">
              <UsersRound className="size-8 opacity-40" />
              <p className="text-sm font-medium">검색 조건과 일치하는 회원이 없습니다.</p>
              <p className="text-xs">검색어를 수정하거나 상태 필터를 변경해 보세요.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/70 md:overflow-x-auto">
              <Table className="block md:table">
                <TableHeader className="hidden bg-muted/30 md:table-header-group">
                  <TableRow>
                    <TableHead className="w-16 text-center font-bold">순위</TableHead>
                    <TableHead>회원 정보</TableHead>
                    <TableHead className="text-right font-bold">총 순자산</TableHead>
                    <TableHead>자산 세부 구성</TableHead>
                    <TableHead className="text-center">상태</TableHead>
                    <TableHead className="text-right">관리 조치</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="block divide-y md:table-row-group md:divide-y-0">
                  {filtered.map((user, index) => {
                    const restricted = user.restricted_at !== null;
                    const rank = user.wealth_rank ?? index + 1;
                    const netWorth = user.total_net_worth ?? '0';
                    const cash = user.cash_balance ?? '0';
                    const bank = user.bank_balance ?? '0';
                    const bond = user.bond_balance ?? '0';
                    const stock = user.stock_eval ?? '0';

                    return (
                      <TableRow key={user.user_id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 p-4 hover:bg-muted/20 transition-colors md:table-row md:p-0">
                        {/* 부자 순위 뱃지 */}
                        <TableCell className="row-span-2 p-0 text-center md:table-cell md:p-2">
                          <RankBadge rank={rank} />
                        </TableCell>

                        {/* 회원 프로필 및 식별자 */}
                        <TableCell className="min-w-0 p-0 md:table-cell md:p-2">
                          <div className="flex flex-col">
                            <Link
                              href={`/admin/users/${encodeURIComponent(user.user_id)}`}
                              className="font-bold text-foreground hover:underline flex items-center gap-1.5"
                            >
                              {user.display_name}
                              {rank === 1 && <Crown className="size-3.5 text-amber-500" />}
                            </Link>
                            <code className="truncate font-mono text-[0.68rem] text-muted-foreground">
                              {user.user_id}
                            </code>
                            <span className="mt-1 text-[0.68rem] text-muted-foreground">
                              로그인 {accessTime(user.last_login_at)} · 최근 접속 {accessTime(user.last_seen_at)}
                            </span>
                            <span className="text-[0.68rem] text-muted-foreground">
                              관리자 페이지 {accessTime(user.last_admin_at)}
                            </span>
                          </div>
                        </TableCell>

                        {/* 총 순자산 */}
                        <TableCell className="col-span-2 p-0 text-left md:table-cell md:p-2 md:text-right">
                          <span className="font-mono font-bold text-base text-primary">
                            {groupDigits(netWorth)}{' '}
                            <span className="text-xs font-normal text-muted-foreground">WLD</span>
                          </span>
                        </TableCell>

                        {/* 자산 세부 구성 칩들 */}
                        <TableCell className="col-span-2 p-0 md:table-cell md:p-2">
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[0.7rem] text-foreground" title="지갑 현금">
                              <Wallet className="size-3 text-emerald-500" />
                              {groupDigits(cash)} WLD
                            </span>
                            {compareAmounts(bank, '0') > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[0.7rem] text-foreground" title="은행 예금">
                                <PiggyBank className="size-3 text-blue-500" />
                                {groupDigits(bank)} WLD
                              </span>
                            )}
                            {compareAmounts(bond, '0') > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[0.7rem] text-foreground" title="가상 국채">
                                <Landmark className="size-3 text-purple-500" />
                                {groupDigits(bond)} WLD
                              </span>
                            )}
                            {compareAmounts(stock, '0') > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[0.7rem] text-foreground" title="보유 주식 평가액">
                                <TrendingUp className="size-3 text-amber-500" />
                                {groupDigits(stock)} WLD
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* 이용 상태 및 제재 사유 */}
                        <TableCell className="col-span-1 p-0 text-left md:table-cell md:p-2 md:text-center">
                          <Badge variant={restricted ? 'destructive' : 'secondary'} className="text-[0.7rem]">
                            {restricted ? '제한됨' : '정상'}
                          </Badge>
                          {restricted && user.restriction_reason && (
                            <p className="mt-1 text-[0.68rem] text-muted-foreground max-w-36 truncate mx-auto" title={user.restriction_reason}>
                              {user.restriction_reason}
                            </p>
                          )}
                        </TableCell>

                        {/* 관리 액션 */}
                        <TableCell className="p-0 text-right md:table-cell md:p-2">
                          <Button asChild variant="outline" size="xs" className="min-h-11 text-xs md:min-h-8">
                            <Link href={`/admin/users/${encodeURIComponent(user.user_id)}`}>
                              상세·로그 <ArrowRight className="size-3.5" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RankBadge({ rank }: { readonly rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center font-bold text-xs size-7 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-xs">
        🥇 1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center font-bold text-xs size-7 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40 shadow-xs">
        🥈 2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center font-bold text-xs size-7 rounded-full bg-amber-800/20 text-amber-600 border border-amber-700/40 shadow-xs">
        🥉 3
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center font-mono text-xs font-semibold text-muted-foreground">
      #{rank}
    </span>
  );
}
