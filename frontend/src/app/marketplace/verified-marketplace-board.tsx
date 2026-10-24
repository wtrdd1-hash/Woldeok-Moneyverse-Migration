'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { groupDigits } from '@/lib/money';
import type { MarketplaceHolding } from './marketplace';
import {
  formatMarketplacePrice,
  type VerifiedMarketplaceListing,
} from './verified-marketplace-listings';

export function VerifiedListingPanel({
  listings,
  mode,
}: {
  readonly listings: readonly VerifiedMarketplaceListing[] | null;
  readonly mode: 'market' | 'mine';
}) {
  const [query, setQuery] = useState('');
  const visible = listings?.filter((item) =>
    mode === 'mine' || item.status === 'ACTIVE'
  ).filter((item) =>
    (item.name + ' ' + item.category + ' ' + item.itemCode)
      .toLocaleLowerCase('ko-KR').includes(query.toLocaleLowerCase('ko-KR'))
  ) ?? [];

  return (
    <section className="grid gap-4" aria-label={mode === 'mine' ? '내 실제 등록 내역' : '실제 등록 매물'}>
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-foreground" role="status">
        PostgreSQL에 기록된 매물만 표시합니다. 구매·등록·취소는 원장 및 영수증 검증 전까지 읽기 전용입니다.
      </p>
      {listings === null ? (
        <div className="rounded-lg border p-5 text-sm" role="alert">
          서버 기록을 조회할 수 없습니다. 빈 목록으로 간주하지 않습니다.
        </div>
      ) : (
        <>
          <label className="grid gap-2 text-sm font-medium sm:max-w-md">
            매물 검색
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-h-11 rounded-md border bg-background px-3 text-foreground"
              placeholder="아이템명·분류 검색"
            />
          </label>
          {visible.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground" role="status">
              {query ? '검색 조건에 맞는 매물이 없습니다.' : '등록된 매물이 없습니다.'}
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
              {visible.map((item) => (
                <li key={item.id} className="min-w-0 rounded-xl border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{item.category} · {item.rarity}</span>
                    <span>{item.status}</span>
                  </div>
                  <h3 className="mt-2 break-words text-base font-semibold">{item.name}</h3>
                  {item.description && <p className="mt-1 break-words text-sm text-muted-foreground">{item.description}</p>}
                  <dl className="mt-3 grid gap-1 text-sm">
                    <div className="flex justify-between gap-3"><dt>수량</dt><dd>{item.quantity}개</dd></div>
                    <div className="flex justify-between gap-3"><dt>등록가</dt><dd className="break-all font-semibold tabular-nums">{formatMarketplacePrice(item.priceWld)} WLD</dd></div>
                    <div className="flex justify-between gap-3"><dt>등록일</dt><dd>{new Date(item.listedAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}</dd></div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

export function VerifiedMarketplaceBoard({
  activeListings,
  myListings,
  holdings,
  walletBalance,
}: {
  readonly activeListings: readonly VerifiedMarketplaceListing[] | null;
  readonly myListings: readonly VerifiedMarketplaceListing[] | null;
  readonly holdings: readonly MarketplaceHolding[] | null;
  readonly walletBalance: string | null;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
        <p className="text-sm">확인된 지갑 현금 잔액: <strong className="tabular-nums">{walletBalance === null ? '조회 불가' : groupDigits(walletBalance) + ' WLD'}</strong></p>
        <button type="button" onClick={() => window.location.reload()}
          className="min-h-11 rounded-md border px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          서버 기록 새로고침
        </button>
      </div>
      <Tabs defaultValue="market">
        <TabsList className="flex h-auto flex-wrap justify-start gap-2">
          <TabsTrigger value="market" className="min-h-11 px-4">거래소 매물</TabsTrigger>
          <TabsTrigger value="mine" className="min-h-11 px-4">내 등록 내역</TabsTrigger>
          <TabsTrigger value="holdings" className="min-h-11 px-4">내 보관함</TabsTrigger>
        </TabsList>
        <TabsContent value="market" className="mt-4">
          <VerifiedListingPanel listings={activeListings} mode="market" />
        </TabsContent>
        <TabsContent value="mine" className="mt-4">
          <VerifiedListingPanel listings={myListings} mode="mine" />
        </TabsContent>
        <TabsContent value="holdings" className="mt-4">
          <section aria-label="실제 보유 아이템">
            {holdings === null ? (
              <p role="alert" className="rounded-lg border p-5">보관함 기록을 조회할 수 없습니다.</p>
            ) : holdings.length === 0 ? (
              <p role="status" className="rounded-lg border p-5">확인된 보유 아이템이 없습니다.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {holdings.map((item) => (
                  <li key={item.catalog_id} className="min-w-0 rounded-lg border p-4">
                    <h3 className="break-words font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category} · {item.quantity}개</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
