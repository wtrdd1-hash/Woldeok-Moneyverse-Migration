import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, FileText, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/api';
import { groupDigits } from '@/lib/money';
import { verifiedEnterpriseDisclosure } from './enterprise-disclosure';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '가상 공기업 운영 현황 | 월덕 머니버스',
  description: '게임 내 가상 공기업 운영 추정치입니다. 실제 국고 입금, 확정 수익 또는 법적 공시가 아닙니다.',
  robots: { index: false, follow: false },
};

export default async function PublicEnterprisesPage() {
  const data = verifiedEnterpriseDisclosure(await publicApi<unknown>('/api/v1/enterprises/public', 0));

  return (
    <div data-page="enterprises" className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <header className="space-y-3">
        <Badge variant="outline">DATABASE-SOURCED · SETTLEMENT UNVERIFIED</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">가상 공기업 운영 현황</h1>
        <p className="text-sm text-muted-foreground">
          게임 내 공기업의 저장된 자산·시간당 수익 추정치를 공개합니다. 예상 배당은 실제 국고 납입이 확인된 금액이 아닙니다.
        </p>
      </header>

      {data === null ? (
        <section role="status" aria-live="polite" className="rounded-2xl border p-6 space-y-3">
          <h2 className="font-bold">공시 정보를 불러올 수 없습니다.</h2>
          <p className="text-sm text-muted-foreground">
            데이터베이스 조회가 확인되지 않아 금액과 공기업 목록을 표시하지 않습니다. 잠시 후 새로고침해 주세요.
          </p>
          <Link href="/enterprises" className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2">다시 조회하기</Link>
        </section>
      ) : (
        <>
          <section aria-label="운영 추정치" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="size-4" />{data.overview.holding_name}</CardTitle>
                <CardDescription>서버 조회 응답 시각: {new Date(data.disclosed_at).toLocaleString('ko-KR')} · {data.overview.governance_model}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">아래 수치는 게임 내 DB 운영 설정을 바탕으로 한 추정치입니다. 실제 거래 원장 정산액이나 국고 입금 영수증이 아니며, WLD는 게임 내 가상 단위입니다.</p>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ['등록 자산', data.overview.total_soe_assets_wld],
                    ['예상 시간당 매출', data.overview.hourly_soe_revenue_wld],
                    ['예상 시간당 이익', data.overview.hourly_soe_profit_wld],
                    ['예상 국고 배당 (정산 미확인)', data.overview.hourly_soe_dividends_wld],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border p-3 min-w-0">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-2 break-all font-mono text-sm font-bold">{groupDigits(value)} WLD</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </section>
          <section aria-labelledby="enterprise-list-title" className="space-y-4">
            <h2 id="enterprise-list-title" className="text-lg font-bold">데이터베이스 등록 공기업 ({data.soes.length}개)</h2>
            {data.soes.length === 0 ? <p role="status">현재 확인된 공기업이 없습니다.</p> : (
              <div className="grid gap-4 md:grid-cols-3">
                {data.soes.map((soe) => (
                  <Card key={soe.code} className="flex flex-col justify-between">
                    <CardHeader>
                      <Badge variant="outline" className="w-fit">{soe.code}</Badge>
                      <CardTitle>{soe.name}</CardTitle>
                      <CardDescription>{soe.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <dl className="space-y-2">
                        <div><dt className="text-xs text-muted-foreground">기관장</dt><dd>{soe.ceo_name}</dd></div>
                        <div><dt className="text-xs text-muted-foreground">등록 자산</dt><dd className="break-all font-mono">{groupDigits(soe.total_assets_wld)} WLD</dd></div>
                        <div><dt className="text-xs text-muted-foreground">예상 시간당 이익</dt><dd className="break-all font-mono">{groupDigits(soe.net_profit_hourly_wld)} WLD</dd></div>
                        <div><dt className="text-xs text-muted-foreground">설정된 예상 배당률</dt><dd>{(soe.dividend_rate_bps / 100).toFixed(2)}%</dd></div>
                      </dl>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/guide/career-mastery"><FileText className="size-4" />직무 가이드<ArrowRight className="size-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
