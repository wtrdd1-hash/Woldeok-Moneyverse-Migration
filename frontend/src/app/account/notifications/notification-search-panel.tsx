'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { parseNotificationSearch, type SearchResult } from './notification-search-client';

const categories = [
  ['ALL', '전체'], ['TRANSACTIONAL', '거래'], ['PRODUCT_ACTIVITY', '활동'],
  ['SEASON_LIVEOPS', '시즌 이벤트'], ['SECURITY_CRITICAL', '보안 경고'],
  ['BUSINESS', '사업'], ['BANK', '은행'], ['SEASON', '시즌'],
  ['SPACE', '공간'], ['SECURITY', '보안'], ['SYSTEM', '시스템'],
] as const;
const headers = { 'content-type': 'application/json', 'x-moneyverse-notification-search': '1' };

function utcStart(day: string): string { return new Date(`${day}T00:00:00.000Z`).toISOString(); }
function utcEnd(day: string): string { return new Date(new Date(`${day}T00:00:00.000Z`).getTime() + 86_400_000).toISOString(); }

export function NotificationSearchPanel() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [fromDay, setFromDay] = useState(() => new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10));
  const [toDay, setToDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const requestGeneration = useRef(0);
  useEffect(() => () => { requestGeneration.current += 1; }, []);

  async function search(cursor?: string, previous?: SearchResult) {
    const id = ++requestGeneration.current;
    setBusy(true);
    setError('');
    if (!cursor) setResult(null);
    try {
      const normalized = query.normalize('NFC').trim();
      if ([...normalized].length < 2 || [...normalized].length > 80) throw new Error('검색어는 2~80자로 입력해 주세요.');
      const fromUtc = utcStart(fromDay);
      const toUtc = utcEnd(toDay);
      if (Date.parse(toUtc) - Date.parse(fromUtc) > 90 * 86_400_000 || fromUtc >= toUtc) {
        throw new Error('조회 기간은 최대 90일이며 시작일은 종료일보다 빨라야 합니다.');
      }
      const body = { query: normalized, fromUtc, toUtc, limit: 20, unreadOnly,
        ...(category === 'ALL' ? {} : { category }), ...(cursor ? { cursor } : {}) };
      const response = await fetch('/api/notifications/search', { method: 'POST', headers, body: JSON.stringify(body), cache: 'no-store' });
      if (!response.ok) {
        if (response.status === 401) throw new Error('로그인이 필요합니다. 다시 로그인해 주세요.');
        if (response.status === 410 || response.status === 409) throw new Error('검색 조건 또는 유효 시간이 변경됐습니다. 검색을 다시 실행해 주세요.');
        if (response.status === 429) throw new Error('요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.');
        throw new Error('검색할 수 없습니다. 알림함은 그대로 사용할 수 있습니다.');
      }
      const next = parseNotificationSearch(await response.json());
      if (id !== requestGeneration.current) return;
      setResult(previous ? { ...next, items: [...previous.items, ...next.items] } : next);
    } catch (err: unknown) {
      if (id === requestGeneration.current) setError(err instanceof Error ? err.message : '검색에 실패했습니다.');
    } finally {
      if (id === requestGeneration.current) setBusy(false);
    }
  }

  return <section aria-label="회원 전용 알림 검색" className="space-y-4 rounded-xl border p-4">
    <h2 className="font-semibold">지난 알림 검색</h2>
    <p className="text-sm text-muted-foreground">검색은 알림을 읽음 처리하거나 잔액을 변경하지 않습니다. 최근 90일 이내에서 검색할 수 있습니다.</p>
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void search(); }}>
      <label className="grid gap-1 text-sm sm:col-span-2">검색어
        <input className="min-h-11 rounded-lg border bg-background px-3" value={query} onChange={(event) => setQuery(event.target.value)} minLength={2} maxLength={160} required placeholder="알림 제목 또는 내용" />
      </label>
      <label className="grid gap-1 text-sm">시작일 (UTC)
        <input type="date" className="min-h-11 rounded-lg border bg-background px-3" value={fromDay} onChange={(event) => setFromDay(event.target.value)} required />
      </label>
      <label className="grid gap-1 text-sm">종료일 (UTC)
        <input type="date" className="min-h-11 rounded-lg border bg-background px-3" value={toDay} onChange={(event) => setToDay(event.target.value)} required />
      </label>
      <label className="grid gap-1 text-sm">알림 분류
        <select className="min-h-11 rounded-lg border bg-background px-3" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={unreadOnly} onChange={(event) => setUnreadOnly(event.target.checked)} />읽지 않은 알림만
      </label>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button type="submit" disabled={busy} className="min-h-11 rounded-lg border bg-primary px-4 text-primary-foreground disabled:opacity-50">검색</button>
        <button type="button" className="min-h-11 rounded-lg border px-4" onClick={() => { requestGeneration.current += 1; setResult(null); setError(''); setQuery(''); }}>검색 초기화</button>
      </div>
    </form>
    <div role="status" aria-live="polite" className="text-sm">
      {busy ? '검색 중입니다.' : error || (result ? `검색 결과 ${result.items.length}건 표시 (전체 건수는 제공하지 않습니다).` : '')}
    </div>
    {result && result.items.length === 0 ? <p className="text-sm">해당 기간에 일치하는 알림이 없습니다.</p> : null}
    {result ? <ul className="space-y-2">{result.items.map((item) => <li key={item.id} className="rounded-lg border p-3">
      <p className="font-medium">{item.title} <span className="text-xs text-muted-foreground">{item.is_read ? '읽음' : '읽지 않음'}</span></p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm">{item.body}</p>
      <p className="mt-1 text-xs text-muted-foreground">{item.category} · {new Date(item.created_at).toLocaleString('ko-KR')}</p>
      {item.link ? <Link href={item.link} className="mt-2 inline-flex min-h-11 items-center text-sm underline">관련 화면 열기</Link> : null}
    </li>)}</ul> : null}
    {result?.hasMore && result.nextCursor ? <button type="button" disabled={busy} onClick={() => void search(result.nextCursor!, result)} className="min-h-11 rounded-lg border px-4 disabled:opacity-50">이전 검색 결과 더 보기</button> : null}
  </section>;
}
