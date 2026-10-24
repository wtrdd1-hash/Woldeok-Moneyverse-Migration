'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Gavel, Radio, WifiOff, X } from 'lucide-react';
import { acquireSiteSocket, releaseSiteSocket } from '@/lib/site-socket';

/** Authenticated marketplace snapshots are the authority, not the preview page or a socket alone. */
interface AuctionSnapshot {
  readonly id: string;
  readonly itemName: string;
  readonly currentBidWld: string;
  readonly highestBidderName: string | null;
  readonly bidCount: number;
  readonly endsAt: string;
}
interface VerifiedBid {
  readonly id: string;
  readonly auctionId: string;
  readonly itemTitle: string;
  readonly amount: bigint;
  readonly bidderName: string;
}

type FeedState = 'loading' | 'ready' | 'login' | 'error';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WLD = /^\d{1,18}(?:\.0{1,6})?$/;
const REFRESH_MS = 30_000;

function parseAmount(value: unknown): bigint | null {
  if (typeof value !== 'string' || !WLD.test(value)) return null;
  return BigInt(value.split('.')[0]!);
}

function parseAuctions(value: unknown): AuctionSnapshot[] | null {
  if (!Array.isArray(value)) return null;
  return value.flatMap((entry: unknown) => {
    if (!entry || typeof entry !== 'object') return [];
    const row = entry as Record<string, unknown>;
    if (
      typeof row.id !== 'string' || !UUID.test(row.id) ||
      typeof row.itemName !== 'string' || !row.itemName.trim() ||
      parseAmount(row.currentBidWld) === null ||
      !Number.isSafeInteger(row.bidCount) || Number(row.bidCount) < 0 ||
      (row.highestBidderName !== null && typeof row.highestBidderName !== 'string') ||
      typeof row.endsAt !== 'string' || !Number.isFinite(Date.parse(row.endsAt))
    ) return [];
    return [{
      id: row.id, itemName: row.itemName.slice(0, 120), currentBidWld: row.currentBidWld as string,
      highestBidderName: row.highestBidderName as string | null,
      bidCount: row.bidCount as number, endsAt: row.endsAt,
    }];
  }).slice(0, 100);
}

function parseBid(value: unknown): VerifiedBid | null {
  if (!value || typeof value !== 'object') return null;
  const bid = value as Record<string, unknown>;
  if (
    typeof bid.id !== 'string' || !bid.id || bid.id.length > 100 ||
    typeof bid.auctionId !== 'string' || !UUID.test(bid.auctionId) ||
    typeof bid.itemTitle !== 'string' || !bid.itemTitle.trim() ||
    typeof bid.bidderName !== 'string' || !bid.bidderName.trim() ||
    typeof bid.bidAmount !== 'number' || !Number.isSafeInteger(bid.bidAmount) || bid.bidAmount <= 0
  ) return null;
  return {
    id: bid.id, auctionId: bid.auctionId, itemTitle: bid.itemTitle.slice(0, 120),
    amount: BigInt(bid.bidAmount), bidderName: bid.bidderName.slice(0, 80),
  };
}

/** Server-confirmed live auction activity. No generated bidders, burns, or claimed socket FPS. */
export function AuctionLiveTickerStrip() {
  const [auctions, setAuctions] = useState<readonly AuctionSnapshot[]>([]);
  const [feedState, setFeedState] = useState<FeedState>('loading');
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState<VerifiedBid | null>(null);
  const rooms = useRef(new Set<string>());
  const seen = useRef(new Set<string>());
  const pending = useRef(new Set<string>());

  const readAuctions = useCallback(async (): Promise<{ rows: AuctionSnapshot[] | null; status: number }> => {
    try {
      const response = await fetch('/api/v1/marketplace/auctions', {
        cache: 'no-store', credentials: 'same-origin',
      });
      if (!response.ok) return { rows: null, status: response.status };
      const rows = parseAuctions(await response.json());
      return { rows, status: rows === null ? 502 : 200 };
    } catch {
      return { rows: null, status: 503 };
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    const socket = acquireSiteSocket();
    setConnected(socket.connected);
    const syncRooms = (rows: readonly AuctionSnapshot[]) => {
      const next = new Set(rows.map((row) => row.id));
      for (const id of rooms.current) {
        if (!next.has(id)) {
          if (socket.connected) socket.emit('auction:unsubscribe', id);
          rooms.current.delete(id);
        }
      }
      for (const id of next) {
        if (!rooms.current.has(id)) {
          rooms.current.add(id);
          if (socket.connected) socket.emit('auction:subscribe', id);
        }
      }
    };
    const refresh = async () => {
      const result = await readAuctions();
      if (disposed) return;
      if (result.rows === null) {
        setFeedState(result.status === 401 || result.status === 403 ? 'login' : 'error');
        setAuctions([]);
        syncRooms([]);
      } else {
        setAuctions(result.rows);
        setFeedState('ready');
        syncRooms(result.rows);
      }
    };
    const opened = () => {
      setConnected(true);
      for (const id of rooms.current) socket.emit('auction:subscribe', id);
    };
    const dropped = () => setConnected(false);
    const received = async (value: unknown) => {
      const bid = parseBid(value);
      if (!bid || !rooms.current.has(bid.auctionId) || seen.current.has(bid.id) || pending.current.has(bid.id)) return;
      pending.current.add(bid.id);
      try {
        // A socket message is not a ledger receipt: confirm current persisted auction state.
        const result = await readAuctions();
        if (disposed) return;
        if (result.rows === null) {
          setFeedState(result.status === 401 || result.status === 403 ? 'login' : 'error');
          setAuctions([]);
          syncRooms([]);
          return;
        }
        setAuctions(result.rows);
        syncRooms(result.rows);
        const row = result.rows.find((item) => item.id === bid.auctionId);
        if (
          !row || row.bidCount < 1 || parseAmount(row.currentBidWld) !== bid.amount ||
          row.highestBidderName !== bid.bidderName || row.itemName !== bid.itemTitle
        ) return;
        seen.current.add(bid.id);
        if (seen.current.size > 100) seen.current.delete(seen.current.values().next().value!);
        setToast(bid);
      } finally {
        pending.current.delete(bid.id);
      }
    };
    socket.on('connect', opened);
    socket.on('disconnect', dropped);
    socket.on('connect_error', dropped);
    socket.on('auction:bid', received);
    // An extension is displayed only after the next authoritative refresh.
    socket.on('auction:extended', refresh);
    void refresh();
    const timer = setInterval(() => { void refresh(); }, REFRESH_MS);
    return () => {
      disposed = true;
      clearInterval(timer);
      socket.off('connect', opened);
      socket.off('disconnect', dropped);
      socket.off('connect_error', dropped);
      socket.off('auction:bid', received);
      socket.off('auction:extended', refresh);
      for (const id of rooms.current) if (socket.connected) socket.emit('auction:unsubscribe', id);
      rooms.current.clear();
      releaseSiteSocket();
    };
  }, [readAuctions]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const connectionLabel = feedState !== 'ready' ? '실시간 정보 확인 불가' :
    connected ? '실시간 연결됨' : '실시간 연결 대기 중';
  const description = feedState === 'loading' ? '경매 기록을 확인하는 중입니다…' :
    feedState === 'login' ? '로그인 후 경매 현황을 확인하세요.' :
    feedState === 'error' ? '경매 기록을 확인할 수 없습니다.' :
    auctions.length === 0 ? '활성 경매가 없습니다.' : null;

  return (
    <>
      <section aria-label="서버 검증 경매 활동" className="min-w-0 rounded-2xl border border-slate-700 bg-slate-900/90 p-3 text-sm text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold"><Radio aria-hidden="true" className="size-4 text-amber-400" />확인된 경매 현황</h2>
          <span role="status" className="flex items-center gap-2 text-xs text-slate-300">
            {connected && feedState === 'ready' ? <span aria-hidden="true" className="size-2 rounded-full bg-emerald-400" /> : <WifiOff aria-hidden="true" className="size-4" />}
            {connectionLabel}
          </span>
        </div>
        {description ? <p role="status" className="mt-2 text-slate-300">{description}</p> : (
          <ul className="mt-3 flex min-w-0 flex-wrap gap-2" aria-label="활성 경매 목록">
            {auctions.map((auction) => (
              <li key={auction.id} className="min-w-0 max-w-full rounded-lg border border-slate-700 px-3 py-2 text-xs">
                <span className="block break-words font-semibold">{auction.itemName}</span>
                <span className="font-mono text-amber-300">{parseAmount(auction.currentBidWld)!.toLocaleString('ko-KR')} WLD</span>
                <span className="ml-2 text-slate-400">{auction.bidCount > 0 ? `${auction.bidCount}회 입찰` : '입찰 기록 없음'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      {toast && (
        <div role="status" aria-live="polite" className="pointer-events-none fixed right-4 top-20 z-50 w-[calc(100vw-2rem)] max-w-sm">
          <div className="pointer-events-auto flex min-w-0 items-start gap-3 rounded-2xl border border-amber-500/50 bg-slate-950 p-3 text-slate-100 shadow-2xl">
            <Gavel aria-hidden="true" className="mt-1 size-5 shrink-0 text-amber-300" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-amber-300">검증된 신규 입찰</p>
              <p className="break-words text-sm font-semibold">{toast.itemTitle}</p>
              <p className="text-xs">{toast.amount.toLocaleString('ko-KR')} WLD · {toast.bidderName}</p>
            </div>
            <button type="button" aria-label="입찰 알림 닫기" onClick={() => setToast(null)} className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
