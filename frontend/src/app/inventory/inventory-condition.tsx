import type { InventoryHolding } from '@/lib/inventory-holdings';

function kstDate(value: string | null): string {
  if (value === null) return '기한 정보 없음 (영구 유지 증명 아님)';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function wld(value: string | null): string {
  return value === null ? '정보 없음' : `${value} WLD`;
}

export function InventoryCondition({ item }: { readonly item: InventoryHolding }) {
  return (
    <details className="mb-3 rounded-xl border border-border/60 p-3 text-xs">
      <summary className="cursor-pointer font-bold min-h-11 flex items-center">
        상태 상세 보기
      </summary>
      <dl className="mt-2 grid grid-cols-1 gap-2 text-muted-foreground">
        <div>
          <dt className="font-semibold">보유 기한 (한국시간)</dt>
          <dd>{kstDate(item.expires_at)}</dd>
        </div>
        <div>
          <dt className="font-semibold">효과 기한 (한국시간)</dt>
          <dd>{kstDate(item.effect_expires_at)}</dd>
        </div>
        <div>
          <dt className="font-semibold">유지비/기한 정책 대상</dt>
          <dd>{item.durable === null ? '정보 없음' : item.durable ? '대상' : '비대상'}</dd>
        </div>
        <div>
          <dt className="font-semibold">현재 표시된 주간 유지비</dt>
          <dd>{wld(item.weekly_cost)}</dd>
        </div>
        <div>
          <dt className="font-semibold">표시된 미납 주수</dt>
          <dd>{item.unpaid_weeks === null ? '정보 없음' : `${item.unpaid_weeks}주`}</dd>
        </div>
        <div>
          <dt className="font-semibold">표시된 미납액</dt>
          <dd>{wld(item.arrears_due)}</dd>
        </div>
        <div>
          <dt className="font-semibold">현재 정책상 유예 한도</dt>
          <dd>{wld(item.arrears_cap)}</dd>
        </div>
        <div>
          <dt className="font-semibold">표시된 이용 중지</dt>
          <dd>
            {item.suspended === null ? '정보 없음' : item.suspended ? '중지됨' : '중지 표시 없음'}
          </dd>
        </div>
      </dl>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        조회 시점에 표시된 상태입니다. 0 WLD·중지 표시 없음은 납부 완료를 증명하지 않습니다. 효과
        기한과 보유 기한은 서로 다르며 정산 완료 여부를 보증하지 않습니다.
      </p>
    </details>
  );
}
