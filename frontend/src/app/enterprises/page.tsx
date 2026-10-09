import type { Metadata } from 'next';
import { Building2, Zap, Globe2, Landmark, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/api';
import { groupDigits } from '@/lib/money';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '국가 공기업 경영정보 공개 (ALIO) | 머니버스 공공 거버넌스',
  description: '월덱 국가투자공사(WSHC) 산하 3대 국가 기간 공기업(W-Power, W-Net, WDB) 및 민간 상장 기업의 경영실적, 배당 납입, 경영평가 대국민 투명 공시 포털입니다.',
};

interface PublicEnterpriseResponse {
  overview: {
    holding_name: string;
    holding_code: string;
    total_soe_assets_wld: string;
    hourly_soe_revenue_wld: string;
    hourly_soe_profit_wld: string;
    hourly_soe_dividends_wld: string;
    governance_model: string;
  };
  soes: Array<{
    code: string;
    name: string;
    category: string;
    ceo_name: string;
    total_assets_wld: string;
    operating_revenue_hourly_wld: string;
    net_profit_hourly_wld: string;
    dividend_rate_bps: number;
    eval_grade: string;
    description: string;
  }>;
  disclosed_at: string;
  standards: string;
}

export default async function PublicEnterprisesPage() {
  const data = await publicApi<PublicEnterpriseResponse>('/api/v1/enterprises/public', 30);

  const overview = data?.overview ?? {
    holding_name: '월덱 국가투자공사 (WSHC)',
    holding_code: 'WSHC_SOE_HOLDING',
    total_soe_assets_wld: '365000000',
    hourly_soe_revenue_wld: '540000',
    hourly_soe_profit_wld: '360000',
    hourly_soe_dividends_wld: '108000',
    governance_model: '싱가포르 테마섹 + 노르웨이 GPFG 하이브리드 지주회사 모델',
  };

  const soes = data?.soes ?? [
    {
      code: 'SOE_POWER',
      name: '월덱 에너지공사 (W-Power)',
      category: 'ENERGY',
      ceo_name: '강전력 (전력에너지전문관)',
      total_assets_wld: '120000000',
      operating_revenue_hourly_wld: '180000',
      net_profit_hourly_wld: '120000',
      dividend_rate_bps: 3000,
      eval_grade: 'S',
      description: '국가 기간 전력 인프라망 공급, 가상 채굴 및 서버 데이터센터 에너지 안정화 전담 공기업',
    },
    {
      code: 'SOE_NET',
      name: '월덱 네트워크교통공사 (W-Net & Transit)',
      category: 'INFRASTRUCTURE',
      ceo_name: '송통신 (망인프라전문관)',
      total_assets_wld: '95000000',
      operating_revenue_hourly_wld: '140000',
      net_profit_hourly_wld: '90000',
      dividend_rate_bps: 3000,
      eval_grade: 'A',
      description: '가상 거래소 결제망, 장터 고속 데이터 통신망 및 상거래 트래픽 인프라 유지보수 전담 공기업',
    },
    {
      code: 'SOE_BANK',
      name: '월덱 국책투자은행 (WDB Development Bank)',
      category: 'DEVELOPMENT_BANK',
      ceo_name: '윤국책 (금융투자전문관)',
      total_assets_wld: '150000000',
      operating_revenue_hourly_wld: '220000',
      net_profit_hourly_wld: '150000',
      dividend_rate_bps: 3000,
      eval_grade: 'A',
      description: '유저 스타트업 저금리 팩토링, 혁신 벤처 펀딩, 국채 발행 및 시장 안정화 전담 국가개발금융공사',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* 헤더 섹션 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono text-primary">
            PUBLIC ALIO DISCLOSURE
          </Badge>
          <Badge className="bg-emerald-600 text-white text-[11px]">OECD 공기업 지배구조 표준</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          국가 공기업 경영정보 공개 시스템 (ALIO)
        </h1>
        <p className="text-sm text-muted-foreground">
          월덱 국가투자공사(WSHC)가 소유한 3대 기간 공기업의 재무 상태, 당기순이익, 국고 법정 배당 납입 실적을 전 국민에게 투명하게 공개합니다.
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
              기준: {new Date(data?.disclosed_at ?? new Date()).toLocaleDateString('ko-KR')} 실시간 공시
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
            <div className="p-3 rounded-xl border border-[#222738] bg-[#121622]">
              <span className="text-zinc-400 block text-[11px]">공기업 합산 자산</span>
              <span className="font-mono font-bold text-base text-zinc-100 mt-1 block">
                {groupDigits(overview.total_soe_assets_wld)} WLD
              </span>
            </div>
            <div className="p-3 rounded-xl border border-[#222738] bg-[#121622]">
              <span className="text-zinc-400 block text-[11px]">시간당 총 매출</span>
              <span className="font-mono font-bold text-base text-[#00E5FF] mt-1 block">
                +{groupDigits(overview.hourly_soe_revenue_wld)} WLD
              </span>
            </div>
            <div className="p-3 rounded-xl border border-[#222738] bg-[#121622]">
              <span className="text-zinc-400 block text-[11px]">시간당 순이익</span>
              <span className="font-mono font-bold text-base text-[#00F59B] mt-1 block">
                +{groupDigits(overview.hourly_soe_profit_wld)} WLD
              </span>
            </div>
            <div className="p-3 rounded-xl border border-[#222738] bg-[#121622]">
              <span className="text-zinc-400 block text-[11px]">국고 귀속 배당금 (30%)</span>
              <span className="font-mono font-bold text-base text-emerald-400 mt-1 block">
                +{groupDigits(overview.hourly_soe_dividends_wld)} WLD
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3대 공기업 카드 */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">3대 기간 공기업 공시 목록</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {soes.map((soe) => (
            <Card key={soe.code} className="border shadow-xs bg-card flex flex-col justify-between">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {soe.code}
                  </Badge>
                  <Badge className="bg-primary/90 text-white font-mono text-[11px]">
                    {soe.eval_grade}등급 우수기관
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
                    <span className="font-mono font-semibold">{groupDigits(soe.total_assets_wld)} WLD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">시간당 순이익</span>
                    <span className="font-mono text-emerald-600 font-semibold">
                      +{groupDigits(soe.net_profit_hourly_wld)} WLD
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border/40">
                    <span className="text-muted-foreground">법정 국고 환원율</span>
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
