import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Coins,
  Flame,
  ShieldCheck,
  FileCheck2,
  Lock,
  Layers,
  ArrowRight,
  Clock,
  Landmark,
  Hash,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { publicApi } from '@/lib/api';
import { canonicalUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '한국조폐공사 (KOMSCO) 화폐 공시 포털 | 머니버스',
  description: '대한민국 국가조폐국 본원통화(M0) 주조 및 화폐 영구 소각(Destroy/Sinks) 공인 증적 투명 공시 포털.',
  alternates: { canonical: canonicalUrl('/mint') },
  robots: { index: true, follow: true },
};

interface SeigniorageLedger {
  nationalMintAuthority: string;
  jurisdiction: string;
  totalMintedM0Wld: string;
  totalProductionCostWld: string;
  totalCumulativeSeigniorageWld: string;
  totalBurnedDestroyedWld: string;
  netCirculationExpansionWld: string;
  activeMintBatchesCount: number;
  burnCertificatesCount: number;
  lastAuditedAt: string;
}

interface BurnCertificate {
  id: string;
  certificateNumber: string;
  amountWld: string;
  sinkCategory: string;
  burnReason: string;
  burnedBy: string;
  proofTransactionId?: string;
  cryptographicProof: string;
  burnedAt: string;
}

function formatWld(amountStr: string | null | undefined): string {
  if (!amountStr || !/^\d+$/.test(amountStr)) return '0 WLD';
  return `${new Intl.NumberFormat('ko-KR').format(BigInt(amountStr))} WLD`;
}

export default async function PublicMintPage() {
  const [seigniorage, certificates] = await Promise.all([
    publicApi<SeigniorageLedger>('/api/v1/mint/seigniorage', 30),
    publicApi<BurnCertificate[]>('/api/v1/mint/audit-certificates', 30),
  ]);

  const certList = Array.isArray(certificates) ? certificates : [];

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-400 font-medium shrink-0">
            <Coins className="size-3.5" />
            대한민국 조폐청 화폐주조권 (Seigniorage)
          </Badge>
          <Badge variant="outline" className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono shrink-0">
            <ShieldCheck className="size-3.5" />
            불변식 100% 무결성 공인 원장
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          한국조폐공사 본원통화 발행 및 소각 공시
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-3xl leading-relaxed">
          머니버스 국정 화폐의 신뢰성을 보장하기 위해 한국조폐공사의 본원통화(M0) 주조 이력,
          시중 과잉 유동성 영구 소각(Destroy/Sinks) 공인 증적 및 주조차익 원장을 전 국민에게 투명하게 공개합니다.
        </p>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">M0 본원통화 누적 주조</span>
              <Coins className="size-4 text-emerald-400" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-400">
              {formatWld(seigniorage?.totalMintedM0Wld)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            정부 승인 공식 주조 총액 (배치 {seigniorage?.activeMintBatchesCount ?? 0}건)
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">통화 영구 소각 (Sink)</span>
              <Flame className="size-4 text-rose-400" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-400">
              {formatWld(seigniorage?.totalBurnedDestroyedWld)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            불가역적 영구 파기 총액 (인증서 {seigniorage?.burnCertificatesCount ?? 0}건)
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">순 통화 팽창량</span>
              <Layers className="size-4 text-sky-400" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-sky-400">
              {formatWld(seigniorage?.netCirculationExpansionWld)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            누적 주조액 - 영구 소각액 (실질 본원통화 순공급량)
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">누적 화폐주조차익</span>
              <Lock className="size-4 text-purple-400" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-purple-400">
              {formatWld(seigniorage?.totalCumulativeSeigniorageWld)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            화폐 액면가 - 제조 비용 (국가 국고 귀속 재원)
          </CardContent>
        </Card>
      </div>

      {/* Burn Certificates / Audit Proofs Section */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <FileCheck2 className="size-5 text-rose-400" />
                공인 통화 영구 소각(Sink) 증적 인증서
              </CardTitle>
              <CardDescription className="mt-1">
                위조 불가능한 암호학적 해시(SHA-256)가 부여된 공식 통화 소각 인증서 목록입니다.
              </CardDescription>
            </div>
            {seigniorage?.lastAuditedAt && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                <Clock className="size-3.5" />
                감사 기준시점: {new Date(seigniorage.lastAuditedAt).toLocaleString('ko-KR')}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {certList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-2 border border-dashed border-border/60 rounded-xl">
              <ShieldCheck className="size-10 mx-auto text-emerald-400/60" />
              <p className="font-semibold text-sm">현재 집행된 영구 소각 내역이 원장에 없습니다.</p>
              <p className="text-xs">모든 본원통화가 건전하게 국고와 시중에서 정상 유통 중입니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b border-border/60">
                  <tr>
                    <th className="px-4 py-3">공인 증적 번호</th>
                    <th className="px-4 py-3">소각 분류</th>
                    <th className="px-4 py-3">소각 사유</th>
                    <th className="px-4 py-3 text-right">소각 수량</th>
                    <th className="px-4 py-3">암호학적 서명 증적</th>
                    <th className="px-4 py-3 text-right">소각 일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {certList.map((cert) => (
                    <tr key={cert.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-foreground">
                        {cert.certificateNumber}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="border-rose-500/40 text-rose-400 bg-rose-500/5 text-[10px]">
                          {cert.sinkCategory}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {cert.burnReason}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-rose-400">
                        -{formatWld(cert.amountWld)}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1" title={cert.cryptographicProof}>
                          <Hash className="size-3 text-muted-foreground/70 shrink-0" />
                          <span className="truncate max-w-[140px]">{cert.cryptographicProof}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground font-mono">
                        {new Date(cert.burnedAt).toLocaleString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Institutional Mandate & Governance Note */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="size-4 text-amber-400" />
              조폐국 화폐 발행 원칙 및 이중 감시 체계 (Dual-Custody)
            </CardTitle>
            <CardDescription>
              화폐 위조 방지 및 하이퍼인플레이션 차단을 위한 제도적 안전장치
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              대한민국 조폐공사는 단독으로 화폐를 시중에 방출할 수 없으며, 반드시 기획재정부의 통화정책 명령서와
              한국은행(중앙은행)의 정식 인수(Acceptance) 절차를 거쳐야만 국고 및 시중으로 유입되는
              엄격한 <strong>이중 권한 분립(Dual-Custody)</strong> 체계를 준수합니다.
            </p>
            <p className="bg-secondary/30 p-3.5 rounded-xl border border-border/50 text-foreground font-medium text-xs sm:text-sm">
              통화량 보존 공식: <code className="font-mono text-emerald-400">국고 잔액 + 시중 유통 현금 + 은행 지준금 + 예치/락업금 = 조폐국 총 발행량(M0)</code>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Landmark className="size-4 text-sky-400" />
              중앙은행 공시 바로가기
            </CardTitle>
            <CardDescription>
              기준금리 및 통화정책 공시 포털
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/central-bank"
              className="group flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 transition-colors"
            >
              <div>
                <div className="font-semibold text-xs sm:text-sm text-foreground">한국은행 (Bank of Korea)</div>
                <div className="text-[11px] text-muted-foreground">기준금리 및 M0/M1/M2 거시지표 공시</div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link
              href="/treasury"
              className="group flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 transition-colors"
            >
              <div>
                <div className="font-semibold text-xs sm:text-sm text-foreground">국가 중앙 국고 (Treasury)</div>
                <div className="text-[11px] text-muted-foreground">정부 재정 및 국고 비축 자금 공시</div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
