import type { Metadata } from 'next';
import { Gavel } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StateBox } from '@/components/d180/primitives';
import { apiOrNull } from '@/lib/api';

export const metadata: Metadata = {
  title: '경매장',
  description: '월덕 머니버스 경매장에 올라온 실제 경매 물품과 현재 입찰가입니다.',
};
export const dynamic = 'force-dynamic';

interface Lot {
  readonly id: string;
  readonly itemTitle: string;
  readonly itemDescription: string;
  readonly remainingSeconds: number;
  readonly startingBid: number;
  readonly currentBid: number;
  readonly bidCount: number;
}

const obj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const int = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;

/** black_market_auctions rows from GET /api/v1/market/secret-auction; anything malformed is dropped. */
function readLots(raw: unknown): Lot[] | null {
  const data = obj(raw) && obj(raw.data) ? raw.data : null;
  if (!data || !Array.isArray(data.auctions)) return null;
  return data.auctions.filter((a): a is Lot =>
    obj(a) && typeof a.id === 'string' && typeof a.itemTitle === 'string' && typeof a.itemDescription === 'string' &&
    int(a.remainingSeconds) && int(a.startingBid) && int(a.currentBid) && int(a.bidCount));
}

function left(seconds: number): string {
  if (seconds <= 0) return '마감';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}시간 ${m}분 남음` : `${Math.max(m, 1)}분 남음`;
}

/**
 * Read-only lot list (QA 2026-11-25). The former page rendered invented lots
 * and invented live bids. Bidding is not offered here: the backend's bid path
 * updates the lot without holding the bidder's WLD.
 */
export default async function AuctionPage() {
  const lots = readLots(await apiOrNull<unknown>('/api/v1/market/secret-auction'));
  return (
    <div data-page="marketplace-auction">
      <PageHeader title="경매장">서버에 등록된 경매 물품과 현재 입찰가입니다. 입찰은 아직 이 화면에서 열리지 않았습니다.</PageHeader>
      {lots === null ? (
        <StateBox kind="unavailable" title="경매 목록을 불러올 수 없어요">잠시 후 다시 확인해 주세요. 목록을 추측해서 보여 주지 않습니다.</StateBox>
      ) : lots.length === 0 ? (
        <StateBox kind="empty" title="진행 중인 경매가 없어요">새 물품이 등록되면 이곳에 표시됩니다.</StateBox>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {lots.map((lot) => {
            const closed = lot.remainingSeconds <= 0;
            return (
              <li key={lot.id} className="rounded-lg border border-[var(--g1-line)] bg-[var(--g1-plum)] p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--g1-plum-2)] text-[var(--g1-violet)]">
                    <Gavel className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[var(--g1-ink)]">{lot.itemTitle}</p>
                    <p className="mt-1 text-sm text-[var(--g1-muted)]">{lot.itemDescription}</p>
                  </div>
                  <span className={`shrink-0 rounded-md px-2 py-1 text-xs ${closed ? 'bg-[var(--g1-plum-2)] text-[var(--g1-muted)]' : 'bg-[var(--g1-plum-2)] text-[var(--g1-mint)]'}`}>
                    {left(lot.remainingSeconds)}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--g1-line)] pt-3 text-sm">
                  <div><dt className="text-xs text-[var(--g1-muted)]">현재 입찰가</dt><dd className="font-semibold tabular-nums text-[var(--g1-ink)]">{lot.currentBid.toLocaleString('ko-KR')} WLD</dd></div>
                  <div><dt className="text-xs text-[var(--g1-muted)]">시작가</dt><dd className="tabular-nums text-[var(--g1-body,#d6dcec)]">{lot.startingBid.toLocaleString('ko-KR')} WLD</dd></div>
                  <div><dt className="text-xs text-[var(--g1-muted)]">입찰 수</dt><dd className="tabular-nums text-[var(--g1-body,#d6dcec)]">{lot.bidCount.toLocaleString('ko-KR')}회</dd></div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
