'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, ShieldAlert, UserRoundCheck, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminUser } from '../types';

type StatusFilter = 'all' | 'active' | 'restricted';

export function UserDirectory({ users }: { readonly users: readonly AdminUser[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const restrictedCount = users.filter((user) => user.restricted_at !== null).length;

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ko-KR');
    return users.filter((user) => {
      const restricted = user.restricted_at !== null;
      if (status === 'restricted' && !restricted) return false;
      if (status === 'active' && restricted) return false;
      return (
        needle === '' ||
        user.display_name.toLocaleLowerCase('ko-KR').includes(needle) ||
        user.user_id.toLocaleLowerCase().includes(needle)
      );
    });
  }, [query, status, users]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Summary icon={UsersRound} label="전체 사용자" value={`${users.length}명`} />
        <Summary
          icon={UserRoundCheck}
          label="정상 이용"
          value={`${users.length - restrictedCount}명`}
        />
        <Summary
          icon={ShieldAlert}
          label="이용 제한"
          value={`${restrictedCount}명`}
          attention={restrictedCount > 0}
        />
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <span className="sr-only">사용자 검색</span>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="이름 또는 사용자 ID 검색"
                className="h-11 pl-9"
              />
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="사용자 상태 필터">
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
                  className="min-h-10"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">조건에 맞는 사용자 {filtered.length}명</p>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              검색 조건에 맞는 사용자가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>제한 사유</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => {
                    const restricted = user.restricted_at !== null;
                    return (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <span className="block font-semibold">{user.display_name}</span>
                          <code className="font-mono text-[0.7rem] text-muted-foreground">
                            {user.user_id}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant={restricted ? 'destructive' : 'secondary'}>
                            {restricted ? '제한됨' : '정상'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-64 text-xs text-muted-foreground">
                          {user.restriction_reason ?? '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm" className="min-h-10">
                            <Link href={`/admin/users/${encodeURIComponent(user.user_id)}`}>
                              상세·로그 <ArrowRight className="size-4" />
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

function Summary({
  icon: Icon,
  label,
  value,
  attention = false,
}: {
  readonly icon: typeof UsersRound;
  readonly label: string;
  readonly value: string;
  readonly attention?: boolean;
}) {
  return (
    <Card className={attention ? 'border-clay bg-clay-soft/20' : undefined}>
      <CardContent className="flex items-center gap-3 py-5">
        <span className="grid size-10 place-items-center rounded-xl bg-muted">
          <Icon className="size-5 text-clay" />
        </span>
        <span className="grid gap-0.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          <strong className="text-xl tabular">{value}</strong>
        </span>
      </CardContent>
    </Card>
  );
}
