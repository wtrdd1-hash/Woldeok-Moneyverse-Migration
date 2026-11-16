import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Evidence policy: this card has no verified GSC-to-member attribution source.
 * Never substitute hardcoded success counts, ranking examples or IndexNow
 * submissions for actual search indexing or registered-member conversions.
 * See the authenticated, separately validated GSC and crawler panels below.
 */
export function SeoFunnelCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">SEO 유입·가입·첫 경제행동 전환 퍼널</CardTitle>
        <CardDescription>
          검색엔진 성과, 방문, 회원가입, 첫 경제행동은 출처와 측정 시점이 다른 독립 지표입니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p role="status" className="font-semibold">실측 연동 미검증 — 통합 전환율 및 키워드 순위 수치를 표시하지 않습니다.</p>
        <p className="text-muted-foreground">
          검증된 자료는 아래의 검색엔진 크롤러 관측 및 Google Search Console 전용 항목에서 각각 확인합니다.
          IndexNow 요청 접수는 검색 색인 성공으로 해석하지 않습니다.
        </p>
        <p className="text-muted-foreground">
          향후 전환 퍼널은 GSC 실데이터와 서버 측 가입·첫 거래 이벤트의 권한·출처·시간 정합성이 검증된 후 별도로 활성화합니다.
        </p>
      </CardContent>
    </Card>
  );
}
