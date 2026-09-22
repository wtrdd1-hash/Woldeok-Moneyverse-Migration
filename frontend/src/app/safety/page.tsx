import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, AlertOctagon, HeartHandshake, FileText, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: '머니버스 안전 센터 (Safety Center)',
  description: '아동·청소년 보호 지침, 비회원 긴급 콘텐츠 삭제 및 권리 구제 센터',
};

export default function SafetyCenterPage() {
  return (
    <div data-page="safety-center" className="mv-page grid gap-6 py-6 max-w-4xl mx-auto px-4">
      <PageHeader
        eyebrow="SAFETY & CONSUMER PROTECTION"
        title="머니버스 안전 & 권리 보호 센터"
      >
        모든 사용자와 청소년이 안심하고 이용할 수 있는 가상 경제 생태계를 지향합니다.
      </PageHeader>

      {/* 긴급 삭제 강조 배너 */}
      <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="size-5 text-destructive" />
            <Badge variant="destructive">TAKE IT DOWN Act 준수</Badge>
          </div>
          <CardTitle className="text-lg font-bold text-destructive mt-1">
            비동의 사생활 침해 및 유해 콘텐츠 긴급 삭제 지원
          </CardTitle>
          <CardDescription className="text-xs text-foreground/80">
            회원 가입이나 로그인 없이도 본인 또는 법정대리인 자격으로 즉시 긴급 콘텐츠 삭제를 요청할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="destructive" className="font-semibold text-xs min-h-10">
            <Link href="/safety/takedown" className="flex items-center gap-1.5">
              비회원 긴급 콘텐츠 삭제 접수처 바로가기 <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* 3대 안전 지침 그리드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <ShieldCheck className="size-6 text-primary mb-1" />
            <CardTitle className="text-sm font-semibold">미성년자 보호 및 연령 보증</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
            만 14세 미만 아동·청소년 계정은 상업 마케팅 및 사행성 모의 게임 접근이 엄격히 차단되며 법정대리인의 동의 절차를 준수합니다.
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <HeartHandshake className="size-6 text-emerald-600 mb-1" />
            <CardTitle className="text-sm font-semibold">안전한 1:1 상호작용</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
            비공개 대화에서의 스토킹, 괴롭힘, 금전 요구 등은 원클릭 차단 및 영구 감사 증거 보존 시스템을 통해 즉각 보호됩니다.
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <FileText className="size-6 text-blue-600 mb-1" />
            <CardTitle className="text-sm font-semibold">공정한 분쟁 해결 및 구제</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
            콘텐츠 삭제 또는 계정 제한 처분에 대해 소명 및 재심(Appeal) 절차를 보장하며 투명한 처리 결과를 고지합니다.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
