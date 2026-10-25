import Link from 'next/link';
import { AlertTriangle, Building2, ArrowRight } from 'lucide-react';
import { apiOrNull } from '@/lib/api';

interface VerifiedSupplyChain {
  readonly ownershipId: string;
  readonly businessSymbol: string;
  readonly available: false;
}

interface SupplyChainWidgetProps {
  readonly businessId?: string | undefined;
  readonly businessName?: string | undefined;
  readonly businessSymbol?: string | undefined;
}

export async function SupplyChainWidget({ businessId, businessName, businessSymbol }: SupplyChainWidgetProps) {
  // Ownership is checked by business_my_ownerships(actor) inside the backend before any label is shown.
  const verified = businessId
    ? await apiOrNull<VerifiedSupplyChain>(`/api/v1/businesses/${encodeURIComponent(businessId)}/supply-chain`)
    : null;
  const isOwned = verified !== null && verified.ownershipId === businessId && verified.businessSymbol === businessSymbol;

  return (
    <section aria-labelledby="supply-chain-title" className="rounded-2xl border border-amber-500/30 bg-card p-4 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <div className="space-y-2">
          <h2 id="supply-chain-title" className="text-lg font-semibold">사업 공급망 · 조달 상태</h2>
          {isOwned ? (
            <p className="flex items-center gap-2 text-sm text-foreground">
              <Building2 aria-hidden="true" className="size-4" />
              <span>보유 사업체 확인됨: {businessName} ({verified.businessSymbol})</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">확인된 사업체 공급망 정보를 불러올 수 없습니다.</p>
          )}
          <p role="status" className="text-sm text-muted-foreground">
            공급망 조달은 현재 이용할 수 없습니다. 재고·가격·수요·WLD 차감·입고 영수증을 검증할 수 없어 조달 및 창고 확정을 차단했습니다.
          </p>
        </div>
      </div>
      <Link
        href="/businesses"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        실제 사업체 및 정산 내역 보기 <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  );
}
