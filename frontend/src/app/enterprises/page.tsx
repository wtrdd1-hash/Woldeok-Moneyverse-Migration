import type { Metadata } from 'next';
import { Building2, Zap, Globe2, Landmark, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/api';
import { formatEnterpriseWld, parsePublicEnterpriseDisclosure } from './public-enterprise-evidence';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '공기업 경영정보 조회 | 머니버스',
  description: '서버에서 확인된 공기업의 자산 및 시간당 경영 추정치를 조회합니다. 국고 배당 납입 증빙과는 구분됩니다.',
  robots: { index: false, follow: false },
};

export default async function PublicEnterprisesPage() {
  const source = await publicApi<unknown>('/api/v1/enterprises/public', 30);
  const data = parsePublicEnterpriseDisclosure(source);
  if (data === null) {
    return (
      <main className="container mx-auto grid max-w-6xl gap-6 px-4 py-8" data-page="public-enterprises">
        <h1 className="text-2xl font-bold">국가 공기업 경영정보</h1>
        <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          공기업 공시 자료를 확인할 수 없습니다. 조회 장애 또는 검증되지 않은 응답일 수 있으며, 자산·매출·배당금이 0이라는 뜻이 아닙니다.
        </p>
        <Link href="/enterprises" className="inline-flex min-h-11 w-fit items-center rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">다시 조회</Link>
      </main>
    );
  }
  const { overview, soes } = data;
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* 헤더 섹션 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono text-primary">
            PUBLIC ENTERPRISE SOURCE SNAPSHOT
          </Badge>
          <Badge className="bg-emerald-600 text-white text-[11px]">서버 조회 자료</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          국가 공기업 경영정보 조회
        </h1>
        <p className="text-sm text-muted-foreground">
          서버가 제공한 공기업의 자산 및 시간당 경영 수치를 조회합니다. 배당 예상액은 계산값이며 국고 납입 영수증이 아닙니다.
        </p>
      </div>

      {/* 국가투자공사(WSHC) 요약 */}
      <Card className="border border-border/80 shadow-xs bg-card">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                {overview.holding_name}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                지배구조: {overview.governance_model}
              </CardDescription>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              API 응답 생성 시각: {new Date(data.disclosed_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} (실제 납입 증빙 아님)
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
            <div className="p-3 rounded-xl border border-[#222738] bg-[#121622]">
              <span className="text-zinc-400 block text-[11px]">공기업 합산 자산</span>
              <span className="font-mono font-bold text-base text-zinc-100 mt-1 block">
                {formatEnterpriseWld(overview.total_soe_assets_wld)} WLD
              </span>
            </div>
            <div className="p-3 rounded-xl border border-[#222738] bg-[#121622]">
              <span className="text-zinc-400 block text-[11px]">시간당 총 매출</span>
              <span className="font-mono font-bold text-base text-[#00E5FF] mt-1 block">
                +{formatEnterpriseWld(overview.hourly_soe_revenue_wld)} WLD
              </span>
            </div>
            <div className="p-3 rounded-xl border border-[#222738] bg-[#121622]">
              <span className="text-zinc-400 block text-[11px]">시간당 순이익</span>
              <span className="font-mono font-bold text-base text-[#00F59B] mt-1 block">
                +{formatEnterpriseWld(overview.hourly_soe_profit_wld)} WLD
              </span>
            </div>
            <div className="p-3 rounded-xl border border-[#222738] bg-[#121622]">
              <span className="text-zinc-400 block text-[11px]">시간당 예상 배당액 (계산값)</span>
              <span className="font-mono font-bold text-base text-emerald-400 mt-1 block">
                +{formatEnterpriseWld(overview.hourly_soe_dividends_wld)} WLD
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3대 공기업 카드 */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">조회된 공기업 목록</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {soes.length === 0 ? <p role="status" className="rounded-lg border p-4 text-sm md:col-span-3">조회 결과에 공기업이 없습니다.</p> : null}
          {soes.map((soe) => (
            <Card key={soe.code} className="border shadow-xs bg-card flex flex-col justify-between">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {soe.code}
                  </Badge>
                  <Badge className="bg-primary/90 text-white font-mono text-[11px]">
                    {soe.eval_grade}등급 · {soe.status}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  {soe.code === 'SOE_POWER' && <Zap className="h-4 w-4 text-amber-500" />}
                  {soe.code === 'SOE_NET' && <Globe2 className="h-4 w-4 text-blue-500" />}
                  {soe.code === 'SOE_BANK' && <Landmark className="h-4 w-4 text-emerald-500" />}
                  {soe.name}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {soe.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                <div className="text-xs bg-muted/20 p-2.5 rounded-lg border space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">기관장</span>
                    <span className="font-medium text-foreground">{soe.ceo_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">자산 규모</span>
                    <span className="font-mono font-semibold">{formatEnterpriseWld(soe.total_assets_wld)} WLD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">시간당 순이익</span>
                    <span className="font-mono text-emerald-600 font-semibold">
                      +{formatEnterpriseWld(soe.net_profit_hourly_wld)} WLD
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border/40">
                    <span className="text-muted-foreground">설정된 배당률 (납입 증빙 아님)</span>
                    <span className="font-mono font-bold text-primary">
                      {(soe.dividend_rate_bps / 100).toFixed(0)}% (사회 환원)
                    </span>
                  </div>
                </div>

                <Link href="/guide/career-mastery" className="block">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    공기업 인재 채용 및 직무 가이드
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
