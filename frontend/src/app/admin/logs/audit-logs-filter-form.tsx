'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Filter, RotateCcw, Search, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export interface AuditFilters {
  readonly from: string;
  readonly to: string;
  readonly administrator: string;
  readonly member: string;
  readonly feature: string;
  readonly action: string;
  readonly request: string;
  readonly transaction: string;
  readonly address: string;
  readonly outcome: string;
  readonly limit: string;
}

export interface UserOption {
  readonly user_id: string;
  readonly display_name: string;
}

interface AuditLogsFilterFormProps {
  readonly filters: AuditFilters;
  readonly users?: readonly UserOption[];
}

const FEATURE_PRESETS = [
  { value: '', label: '전체 기능' },
  { value: 'audit', label: '🛡️ audit (감사 로그)' },
  { value: 'controls', label: '⚡ controls (킬스위치/통제)' },
  { value: 'treasury', label: '🏛️ treasury (국고/지출)' },
  { value: 'users', label: '👥 users (회원/권한 관리)' },
  { value: 'economy', label: '💰 economy (경제 거버넌스)' },
  { value: 'stock', label: '📈 stock (가상주식/거래정지)' },
  { value: 'security', label: '🔐 security (보안/세션)' },
  { value: 'support', label: '💬 support (고객지원/문의)' },
  { value: 'content', label: '📸 content (콘텐츠/사진심사)' },
  { value: 'work', label: '⚒️ work (직업/보상)' },
];

const OUTCOMES = [
  { value: '', label: '전체 결과' },
  { value: 'success', label: '✅ 성공' },
  { value: 'failure', label: '🚨 실패' },
  { value: 'partial', label: '⚠️ 부분 성공' },
];

const LIMITS = ['30', '50', '100'];

export function AuditLogsFilterForm({ filters, users = [] }: AuditLogsFilterFormProps) {
  const [fromDate, setFromDate] = useState(filters.from);
  const [toDate, setToDate] = useState(filters.to);

  // 활성 필터 개수 계산 (기본 limit 제외)
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'limit') return value !== '30' && value !== '';
    return value !== '';
  }).length;

  // 모바일에서는 기본 접힘, 활성 필터가 있으면 자동 확장
  const [isOpen, setIsOpen] = useState(activeFilterCount > 0);

  const handleDatePreset = (preset: 'today' | 7 | 30 | 'all') => {
    if (preset === 'all') {
      setFromDate('');
      setToDate('');
      return;
    }
    const now = new Date();
    const toIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    let fromIso = '';
    if (preset === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      fromIso = new Date(startOfDay.getTime() - startOfDay.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    } else {
      const past = new Date(now.getTime() - preset * 24 * 60 * 60 * 1000);
      fromIso = new Date(past.getTime() - past.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    setFromDate(fromIso);
    setToDate(toIso);
  };

  return (
    <Card className="border-border/80 shadow-xs transition-all">
      <CardHeader className="cursor-pointer pb-3 select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-primary" />
            <CardTitle className="text-base font-bold">감사 로그 조건 검색</CardTitle>
            {activeFilterCount > 0 ? (
              <Badge variant="default" className="text-xs px-2 py-0.5">
                {activeFilterCount}개 필터 적용 중
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground font-normal">
                전체 최신순
              </Badge>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {isOpen ? (
              <>
                <ChevronUp className="size-4" />
                <span>필터 접기</span>
              </>
            ) : (
              <>
                <ChevronDown className="size-4" />
                <span>필터 열기</span>
              </>
            )}
          </Button>
        </div>
        <CardDescription className="text-xs">
          {isOpen
            ? '닉네임 또는 UUID, 기능, IP 주소로 정밀 필터링합니다. 비어 있는 항목은 조건을 걸지 않습니다.'
            : '클릭하여 닉네임, IP, 액션, 기간별 검색 필터를 전개할 수 있습니다.'}
        </CardDescription>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-1">
          {/* 유저 자동완성 데이터리스트 */}
          {users.length > 0 && (
            <datalist id="audit-user-suggestions">
              {users.map((u) => (
                <option key={u.user_id} value={u.display_name}>
                  {u.user_id}
                </option>
              ))}
            </datalist>
          )}

          <form method="get" className="grid gap-4">
            {/* 날짜 프리셋 칩 */}
            <div className="flex flex-wrap items-center gap-1.5 pb-1">
              <span className="text-xs font-semibold text-muted-foreground mr-1">기간 프리셋:</span>
              <button
                type="button"
                onClick={() => handleDatePreset('today')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border/80 bg-muted/40 hover:bg-muted text-foreground transition-colors"
              >
                오늘
              </button>
              <button
                type="button"
                onClick={() => handleDatePreset(7)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border/80 bg-muted/40 hover:bg-muted text-foreground transition-colors"
              >
                최근 7일
              </button>
              <button
                type="button"
                onClick={() => handleDatePreset(30)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border/80 bg-muted/40 hover:bg-muted text-foreground transition-colors"
              >
                최근 30일
              </button>
              <button
                type="button"
                onClick={() => handleDatePreset('all')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border/80 bg-muted/40 hover:bg-muted text-muted-foreground transition-colors"
              >
                전체 기간
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* 기간 검색 */}
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">기간 시작 (From)</span>
                <Input
                  name="from"
                  type="datetime-local"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">기간 끝 (To)</span>
                <Input
                  name="to"
                  type="datetime-local"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </label>

              {/* 관리자 ID / 닉네임 */}
              <FilterField
                label="관리자 (닉네임 또는 UUID)"
                name="administrator"
                value={filters.administrator}
                placeholder="예: admin 또는 UUID"
                list={users.length > 0 ? 'audit-user-suggestions' : undefined}
                hint="닉네임을 입력하면 해당 회원의 UUID로 자동 변환 검색됩니다."
              />

              {/* 대상 회원 ID / 닉네임 */}
              <FilterField
                label="대상 회원 (닉네임 또는 UUID)"
                name="member"
                value={filters.member}
                placeholder="예: 홍길동 또는 UUID"
                list={users.length > 0 ? 'audit-user-suggestions' : undefined}
                hint="대상/주체로 기록된 회원 로그를 함께 찾습니다."
              />

              {/* 주요 기능 셀렉트 */}
              <FilterSelect label="기능 (Feature)" name="feature" value={filters.feature}>
                {FEATURE_PRESETS.map((entry) => (
                  <option key={entry.value || 'all'} value={entry.value}>
                    {entry.label}
                  </option>
                ))}
              </FilterSelect>

              {/* 액션 직접 입력 또는 프리셋 */}
              <FilterField
                label="액션 상세 (Action)"
                name="action"
                value={filters.action}
                placeholder="예: admin.policy, restrict"
                hint="특정 액션명 또는 접두사 검색 지원"
              />

              {/* IP 주소 */}
              <FilterField
                label="접속 IP 주소"
                name="address"
                value={filters.address}
                placeholder="예: 211.43.18.200"
                hint="마스킹 전 원본 IP 주소로 매칭 검색합니다."
              />

              {/* 요청 ID */}
              <FilterField
                label="요청 ID (Request UUID)"
                name="request"
                value={filters.request}
                placeholder="UUID"
              />

              {/* 거래 ID */}
              <FilterField
                label="원장 거래 ID (Transaction UUID)"
                name="transaction"
                value={filters.transaction}
                placeholder="UUID"
              />

              {/* 결과 셀렉트 */}
              <FilterSelect label="실행 결과 (Outcome)" name="outcome" value={filters.outcome}>
                {OUTCOMES.map((entry) => (
                  <option key={entry.value || 'all'} value={entry.value}>
                    {entry.label}
                  </option>
                ))}
              </FilterSelect>

              {/* 페이지당 표시 개수 */}
              <FilterSelect label="표시 개수" name="limit" value={filters.limit}>
                {LIMITS.map((val) => (
                  <option key={val} value={val}>
                    {val}건씩 보기
                  </option>
                ))}
              </FilterSelect>
            </div>

            {/* 하단 액션 버튼 그룹 */}
            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
              <Button type="submit" className="min-h-10 px-5 gap-1.5 font-bold shadow-xs">
                <Search className="size-4" />
                검색 실행
              </Button>
              <Button asChild variant="ghost" className="min-h-10 gap-1 text-muted-foreground hover:text-foreground">
                <Link href="/admin/logs">
                  <RotateCcw className="size-3.5" />
                  조건 초기화
                </Link>
              </Button>
              <div className="ml-auto flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="min-h-10 text-xs">
                  <Link href="/admin/logs/integrity">
                    <ShieldCheck className="size-3.5 mr-1 text-emerald-500" />
                    무결성 검증 →
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="min-h-10 text-xs">
                  <Link href="/admin/logs/delivery">Discord 전달 로그 →</Link>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
}

function FilterField({
  label,
  name,
  value,
  type = 'text',
  placeholder,
  hint,
  list,
}: {
  readonly label: string;
  readonly name: string;
  readonly value: string;
  readonly type?: string | undefined;
  readonly placeholder?: string | undefined;
  readonly hint?: string | undefined;
  readonly list?: string | undefined;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Input
        name={name}
        type={type}
        defaultValue={value}
        autoComplete="off"
        {...(list ? { list } : {})}
        placeholder={placeholder}
        className="h-9 text-xs placeholder:text-muted-foreground/40"
      />
      {hint && <span className="text-[0.68rem] text-muted-foreground/80">{hint}</span>}
    </label>
  );
}

function FilterSelect({
  label,
  name,
  value,
  children,
}: {
  readonly label: string;
  readonly name: string;
  readonly value: string;
  readonly children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs shadow-2xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {children}
      </select>
    </label>
  );
}
