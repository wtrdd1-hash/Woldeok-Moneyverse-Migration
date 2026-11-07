import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Home, RefreshCw, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { parseVerifiedPersonalSpaces } from '@/lib/personal-spaces-source';

/** A verified owner read is the only authority for personal spaces. */
export async function PersonalSpacesView() {
  let spaces = null;
  try {
    spaces = parseVerifiedPersonalSpaces(await api<unknown>('/api/v1/spaces'));
  } catch {
    // An auth, consent, ACL or upstream error must never become an empty portfolio.
  }

  return (
    <section aria-label="개인 공간 조회" className="mx-auto grid w-full max-w-4xl gap-4">
      {spaces === null ? (
        <Card className="border-amber-500/40" role="status" aria-live="polite">
          <CardHeader className="flex flex-row items-center gap-3">
            <ShieldAlert aria-hidden="true" className="size-6 shrink-0 text-amber-600" />
            <CardTitle>개인 공간 소유 내역을 확인할 수 없습니다</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7">
            <p>인증·동의 또는 서버 원장 조회가 확인되지 않았습니다. 브라우저에 저장된 공간과 임대료는 실제 소유권이나 입금 증빙이 아닙니다.</p>
            <p>가상 부동산 매입, 확장 및 임대료 수령은 검증된 거래 원장이 마련될 때까지 제공하지 않습니다.</p>
            <nav aria-label="개인 공간 재조회" className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="min-h-11"><Link href="/spaces"><RefreshCw aria-hidden="true" className="size-4" />다시 확인</Link></Button>
              <Button asChild variant="secondary" className="min-h-11"><Link href="/login"><ArrowLeft aria-hidden="true" className="size-4" />로그인 확인</Link></Button>
            </nav>
          </CardContent>
        </Card>
      ) : spaces.length === 0 ? (
        <Card role="status" aria-live="polite">
          <CardHeader><CardTitle>확인된 개인 공간이 없습니다</CardTitle></CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">인증된 서버가 현재 보유 공간 0건을 반환했습니다. 브라우저의 임시 공간은 소유권에 포함하지 않습니다.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4" role="region" aria-label="검증된 개인 공간 목록">
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">인증된 서버에서 확인한 개인 공간 {spaces.length}건입니다. WLD 거래 및 임대료는 이 목록으로 증명되지 않습니다.</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {spaces.map((space) => (
              <li key={space.id}>
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <Home aria-hidden="true" className="size-5 shrink-0" />
                    <CardTitle className="min-w-0 break-words text-base">{space.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground">
                    <p className="font-mono break-all">{space.spaceType}</p>
                    <p>공개 범위: {space.privacy}</p>
                    <p>서버 마지막 수정: <time dateTime={space.updatedAt}>{space.updatedAt}</time></p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-2 text-xs text-muted-foreground"><AlertTriangle aria-hidden="true" className="size-4" />이 화면은 소유 목록 조회 전용이며 거래 완료 영수증이 아닙니다.</p>
        </div>
      )}
    </section>
  );
}
