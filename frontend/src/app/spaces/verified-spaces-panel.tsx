import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface VerifiedSpace {
  readonly id: string;
  readonly user_id: string;
  readonly name: string;
  readonly space_type: string;
  readonly privacy: string;
  readonly created_at: string;
}

/** Never treat browser localStorage or a simulated purchase as owner evidence. */
export function VerifiedSpacesPanel({
  state,
  spaces = [],
}: {
  readonly state: 'guest' | 'unavailable' | 'ready';
  readonly spaces?: readonly VerifiedSpace[];
}) {
  return (
    <section aria-labelledby="verified-spaces-title" className="space-y-4">
      <div className="space-y-1">
        <h2 id="verified-spaces-title" className="text-xl font-bold">실제 소유 공간</h2>
        <p className="text-sm text-muted-foreground">
          회원별 PostgreSQL 소유 기록만 표시합니다. 브라우저 모의 분양·임대료·WLD 정산은 지원하지 않습니다.
        </p>
      </div>
      {state === 'guest' ? (
        <Card><CardContent className="space-y-3 py-6 text-sm">
          <p>실제 소유 공간을 보려면 로그인하세요.</p>
          <Link href="/login" className="inline-flex min-h-11 items-center rounded-lg border px-4 font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">로그인하여 확인</Link>
        </CardContent></Card>
      ) : state === 'unavailable' ? (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          소유 공간을 조회할 수 없습니다. 서버 연결을 확인한 뒤 다시 시도해 주세요. 소유 공간이 없다는 뜻은 아닙니다.
        </div>
      ) : spaces.length === 0 ? (
        <div role="status" className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          서버에서 확인된 소유 공간이 없습니다. 구매·임대료 기능은 별도 검증 전까지 제공되지 않습니다.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2" aria-label="서버에서 확인된 소유 공간 목록">
          {spaces.map((space) => (
            <li key={space.id}>
              <Card className="h-full">
                <CardHeader className="space-y-2">
                  <CardTitle className="break-words text-base">{space.name}</CardTitle>
                  <Badge variant="outline" className="w-fit">{space.privacy === 'PUBLIC' ? '공개 공간' : '비공개 공간'}</Badge>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p className="break-all">공간 유형: {space.space_type}</p>
                  <p>서버 소유권 기록 확인 · 읽기 전용</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
