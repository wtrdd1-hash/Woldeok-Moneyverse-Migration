import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Google Search Console verified evidence card.
 * Reflects authentic GSC performance data (28-day & 7-day verified source).
 */
export function SeoFunnelCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">📊 Google Search Console 실측 검색 실적 (GSC Verified Source)</CardTitle>
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            실측 캡처 연동 (2026-11-17 KST)
          </span>
        </div>
        <CardDescription>
          Google Search Console 웹(텍스트) 검색 실적 28일 및 최근 7일 집계 실측 수치입니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <span className="text-xs text-muted-foreground">28일 총 노출수</span>
            <div className="mt-1 text-xl font-bold tracking-tight text-foreground">1.05만회</div>
            <span className="text-[11px] text-muted-foreground">Google 웹 검색 결과 노출</span>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <span className="text-xs text-muted-foreground">28일 총 클릭수</span>
            <div className="mt-1 text-xl font-bold tracking-tight text-foreground">83회</div>
            <span className="text-[11px] text-muted-foreground">실제 유입 클릭수</span>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <span className="text-xs text-muted-foreground">28일 평균 CTR</span>
            <div className="mt-1 text-xl font-bold tracking-tight text-foreground">0.8%</div>
            <span className="text-[11px] text-muted-foreground">클릭률</span>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <span className="text-xs text-muted-foreground">28일 평균 게재순위</span>
            <div className="mt-1 text-xl font-bold tracking-tight text-foreground">18.1위</div>
            <span className="text-[11px] text-muted-foreground">키워드 평균 순위</span>
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-muted/20 p-3 text-xs leading-relaxed">
          <div className="font-semibold text-foreground mb-1">📅 최근 7일 구간 실측 (11/08 ~ 11/14):</div>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
            <li><strong>총 노출수:</strong> 3.74천회 (11월 11일 피크 노출 794회)</li>
            <li><strong>총 클릭수:</strong> 21회 (11월 11일 클릭 2회)</li>
            <li><strong>검증 상태:</strong> 28일 집계와 7일 집계 구간이 중첩되므로 합산하지 않고 독립 구간으로 정밀 관측합니다.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
