import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDay } from '@/lib/money';

interface VerifiedHolding {
  readonly catalog_id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly quantity: number;
  readonly acquired_at: string;
  readonly expires_at: string | null;
  readonly rarity: string;
  readonly is_equipped: boolean;
  readonly suspended: boolean;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !Number.isNaN(Date.parse(value));
}

/**
 * A collection is not a second ownership ledger. Only an authenticated,
 * owner-scoped shop holdings response can establish that an item is held.
 * A malformed response must not be mistaken for a verified empty archive.
 */
export function verifyCollectionHoldings(response: unknown): VerifiedHolding[] | null {
  if (!response || typeof response !== 'object' || !('holdings' in response) || !Array.isArray(response.holdings)) {
    return null;
  }

  const verified: VerifiedHolding[] = [];
  const seen = new Set<string>();
  for (const value of response.holdings as unknown[]) {
    if (!value || typeof value !== 'object') return null;
    const item = value as Record<string, unknown>;
    if (
      typeof item.catalog_id !== 'string' || !UUID.test(item.catalog_id) ||
      typeof item.code !== 'string' || !item.code.trim() ||
      typeof item.name !== 'string' || !item.name.trim() ||
      typeof item.description !== 'string' ||
      typeof item.category !== 'string' || !item.category.trim() ||
      !Number.isSafeInteger(item.quantity) || (item.quantity as number) <= 0 ||
      !isTimestamp(item.acquired_at) ||
      (item.expires_at !== null && !isTimestamp(item.expires_at)) ||
      typeof item.rarity !== 'string' ||
      typeof item.is_equipped !== 'boolean' ||
      (item.suspended !== undefined && typeof item.suspended !== 'boolean')
    ) return null;
    if (seen.has(item.catalog_id)) return null;
    seen.add(item.catalog_id);
    verified.push({
      catalog_id: item.catalog_id,
      code: item.code,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.quantity as number,
      acquired_at: item.acquired_at,
      expires_at: item.expires_at as string | null,
      rarity: item.rarity,
      is_equipped: item.is_equipped,
      suspended: item.suspended === true,
    });
  }
  return verified;
}

export function CollectionArchive({ response }: { readonly response: unknown }) {
  const holdings = verifyCollectionHoldings(response);

  if (holdings === null) {
    return (
      <section aria-labelledby="collection-items-title" role="status" className="grid gap-4">
        <h2 id="collection-items-title" className="text-lg font-bold">내 소장품</h2>
        <EmptyState
          title="보유 정보를 확인하지 못했어요."
          description="서버에서 확인되지 않은 아이템을 소유한 것으로 표시하지 않습니다. 잠시 후 다시 확인해 주세요."
        />
        <Link href="/collections" className="inline-flex min-h-11 items-center self-start rounded-md border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          다시 확인하기
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="collection-items-title" className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="collection-items-title" className="text-lg font-bold">
          서버에서 확인한 내 소장품 ({holdings.length}종)
        </h2>
        <Link href="/inventory" className="inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          보관함에서 관리하기 →
        </Link>
      </div>
      {holdings.length === 0 ? (
        <EmptyState
          title="보유한 아이템이 아직 없어요."
          description="현재 계정의 보유 목록에 기록된 아이템이 없습니다. 상점에서 구매하거나 획득한 아이템은 서버에서 확인한 뒤 이곳에 표시됩니다."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {holdings.map((item) => {
            const expired = item.expires_at !== null && Date.parse(item.expires_at) <= Date.now();
            return (
              <li key={item.catalog_id}>
                <Card className="h-full">
                  <CardContent className="grid gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{item.category}</Badge>
                      {item.rarity && <Badge variant="secondary">{item.rarity}</Badge>}
                      {expired && <Badge variant="destructive">기간 만료</Badge>}
                      {item.suspended && <Badge variant="destructive">사용 정지</Badge>}
                      {item.is_equipped && !expired && !item.suspended && <Badge>장착 중</Badge>}
                    </div>
                    <h3 className="text-base font-bold break-words">{item.name}</h3>
                    {item.description && <p className="text-sm text-muted-foreground break-words">{item.description}</p>}
                    <dl className="grid gap-1 text-sm">
                      <div className="flex flex-wrap justify-between gap-2">
                        <dt>서버 보유 수량</dt>
                        <dd className="font-semibold tabular-nums">{item.quantity.toLocaleString('ko-KR')}개</dd>
                      </div>
                      <div className="flex flex-wrap justify-between gap-2">
                        <dt>획득 기록</dt>
                        <dd><time dateTime={item.acquired_at}>{formatDay(item.acquired_at)}</time></dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
      <p className="max-w-prose text-sm text-muted-foreground">
        이 화면은 실제 보유 목록의 읽기 전용 보기입니다. 큐레이션 메모, 즐겨찾기, 달성 단계 및 공개 공유 링크는 현재 서버 저장 기능이 제공되지 않습니다.
      </p>
    </section>
  );
}
