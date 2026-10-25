'use client';

import Link from 'next/link';
import { ArrowLeftRight, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { MarketplaceHolding } from './marketplace';

interface DirectTradeViewProps {
  readonly holdings: readonly MarketplaceHolding[];
  readonly userBalanceWld: string;
  readonly currentUserId?: string;
  readonly currentUserName?: string;
}

/**
 * No member trade can be represented as settled until the backend can prove
 * an atomic WLD + inventory ledger receipt. The protected API returns 503.
 * Never fall back to fabricated peers, offers, or client-side swap success.
 */
export function DirectTradeView(_props: DirectTradeViewProps) {
  return (
    <section aria-labelledby="direct-trade-status-title" className="min-w-0">
      <Card className="border-amber-500/30">
        <CardHeader>
          <CardTitle id="direct-trade-status-title" className="flex items-center gap-2 text-base sm:text-lg">
            <ArrowLeftRight aria-hidden="true" className="size-5 shrink-0" />
            P2P 1:1 직거래
          </CardTitle>
          <CardDescription>회원 간 WLD·아이템 교환은 서버의 원자적 정산 기록이 확인되어야 합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div role="status" aria-live="polite" className="flex items-start gap-3 rounded-xl bg-amber-500/10 p-4">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <p>
              직거래 기능은 현재 중단되어 있습니다. 원장과 보유 아이템의 동시 이전이 검증되기 전까지
              거래 제안·수락·최종 승인 및 수령 영수증을 제공하지 않습니다.
            </p>
          </div>
          <p className="text-muted-foreground">
            기존 화면의 거래 제안과 체결 예시는 실제 회원 거래가 아니며 제거되었습니다.
            자산을 확인하려면 지갑의 서버 기록을 이용하세요.
          </p>
          <Link
            href="/wallet"
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            내 지갑 확인하기
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
