# 월덕 머니버스 — 광고 전용 수익화 명세

> 버전: v2026.10.03.512
> 상태: PLANNING / 현금 수익화 권위
> 날짜: 2026-10-03
> 권위 채택: v507 해외 광고경제 + v512 Search Console 색인회복 선행게이트를 현재 기획 권위로 통합.
> 영문 기준 문서: [AD_ONLY_ADVERTISING_REVENUE_SPEC.md](AD_ONLY_ADVERTISING_REVENUE_SPEC.md)

## 1. 권위와 사업자 제약

현재 등록된 사업 범위가 명시적으로 확대되고 검토되기 전까지 **현금 수익은 광고수익으로만 제한**한다.

현재 허용 현금 채널:
- 광고 허용 공개 콘텐츠의 Google AdSense/Google 게시자 광고;
- route 제외와 실측 실험을 거친 AdSense Auto Ads 및 기타 Google 광고 형식;
- 자격·계약·개인정보·트래픽 품질 게이트를 통과한 경우의 다른 광고 관리 네트워크.

BLOCKED 현금 채널:
- 유료 구독/광고제거 구독;
- 유료 디지털 상품, 코스메틱, 테마, 프로필 또는 entitlement;
- 유료 WLD/WDX 또는 유료 게임/경제 가치;
- 유료 확률형 상품, 유료 카지노 입장/가치/stake;
- 사용자에게 받는 마켓 수수료;
- 후원금, 멤버십, 유료 API/B2B, 제휴수수료, 직접 상품판매. 단, 향후 사업자·세무·법률 검토가 특정 채널을 명시적으로 허용하면 별도 권위 변경으로만 추가한다.

향후 허용 범위를 변경하려면 허용 사업활동을 명시하고 이 명세, PROJECT_PLAN, 대한민국 법령 감사, 결제/운영 통제를 같은 작업에서 갱신한 뒤 구현한다.

## 2. 월 광고수익 100만 원 목표 모델

Google의 Page RPM 정의는 예상수입을 pageview로 나눈 뒤 1,000을 곱하는 방식이다.

`월 광고수익 = 월 pageview / 1,000 × 실측 Page RPM`

아래 값은 **예측/보장이 아닌 시나리오 입력값**이다.

| 실측 Page RPM | 월 100만 원에 필요한 pageview |
|---:|---:|
| 2,000원 | 500,000 |
| 3,000원 | 333,334 |
| 5,000원 | 200,000 |
| 7,500원 | 133,334 |
| 10,000원 | 100,000 |
| 15,000원 | 66,667 |
| 20,000원 | 50,000 |

운영 목표는 “클릭을 늘린다”가 아니다. **정상 인간 사용자의 유효 pageview를 늘리고, viewability/광고형식을 안전하게 개선하며, 실제 Page RPM을 측정**한다.

## 3. 광고 수익 성장 단계

### Phase A — AdSense 기준선
- 현재 승인된 publisher/ads.txt 구조를 유지한다.
- 30일 Page RPM, ad RPM, impression, ad request, coverage, viewability, revenue/pageview를 route·locale·device·traffic source별로 측정한다.
- 광고 허용 공개 콘텐츠와 로그인/경제행동/계정/관리자 등 차단 영역을 분리한다.
- 실측값을 기준선으로 사용하며 누락 RPM을 업계 평균으로 임의 보정하지 않는다.

### Phase B — AdSense 최적화
- Google Auto Ads/Experiments로 광고량·형식을 A/B 실험한다.
- 유지율/작업완료/Core Web Vitals/오클릭 가드레일을 둔다.
- 충분한 본문이 있는 in-page 배치를 우선하고 광고 공간을 미리 예약해 CLS를 방어한다.
- route 제외는 fail-closed를 유지한다.

### Phase C — 프리미엄 광고 네트워크 자격
- 트래픽 품질과 공급자 자격조건을 충족한 뒤 다른 광고 관리 네트워크를 재검토한다.
- 조사 예시: Journey by Mediavine은 현재 30일 Tier-1 국가 세션 1,000건 이상과 원본 audience-first 콘텐츠, 정상 트래픽을 요구한다고 안내한다.
- 이는 추가 **광고수익 채널** 후보일 뿐 유료상품/구독 허용을 뜻하지 않는다.

## 4. 광고 route 계약

광고는 실제 금융/게임 의사결정 또는 중요 작업을 방해하지 않는 검토된 공개 콘텐츠에만 허용한다.

계속 차단:
- 지갑, 송금, 대출;
- WDX 의사결정/주문 등 거래 화면;
- 카지노/확률형 화면;
- 계정/보안/결제실패;
- 관리자 action 콘솔;
- 비공개 채팅/사용자 비공개 데이터;
- 광고가 목적을 혼동시킬 수 있는 법률/개인정보/동의 흐름.

기존 명시적 allowlist/blocklist가 route 단위의 후속 검토로 대체되기 전까지 권위다.

## 5. 광고수익을 위한 트래픽 성장

우선순위:
1. Search Console의 crawl/index/canonical 진실성;
2. 검색 의도를 완결적으로 해결하는 독창적 계산기·가이드;
3. 고유입 도구에서 실제 관련 가이드로의 내부링크;
4. 추가 locale 확장 전 EN/KO locale 정확성;
5. publication/moderation 품질 게이트가 있는 장기 공개 콘텐츠;
6. 그 뒤에만 사용자 고유가치가 있는 programmatic template 확대.

광고 인벤토리 확보만을 위해 얇은 페이지를 대량 생성하지 않는다. 저품질 유료트래픽, traffic exchange, 광고조회/클릭 보상, 광고 클릭 유도, 자동 impression 생성을 금지한다.

## 6. 광고 실험 가드레일

각 실험은 다음을 기록한다.
- 실험 ID와 정확한 기간;
- 원본/변형 설정;
- 대상 트래픽 비율;
- Page RPM/총 광고수익;
- 가능하면 viewability/coverage;
- LCP/INP/CLS;
- bounce/engagement/task completion;
- 오클릭/사용자 불만 신호;
- invalid traffic/정책 경고;
- rollback 판단.

광고수익이 올라도 invalid traffic 위험, 정책 위험, 사용자 신뢰 또는 핵심 UX가 유의미하게 나빠지면 승리 실험으로 채택하지 않는다.

## 7. 월 운영 대시보드

필수:
- 예상 광고수익과 확정 광고수익 분리;
- Page RPM/ad RPM;
- pageview/ad impression;
- 매출 상위 route;
- locale/device/source별 광고수익;
- 트래픽 소스 집중도;
- 검색 노출/클릭과 색인 페이지 추이;
- invalid-traffic 조정/경고 상태;
- 광고 template별 Core Web Vitals;
- 광고 정책 상태.

월 100만 원 목표는 확정/실측 자료로 판정한다. 세금, 인프라, 기타 운영비는 별도로 추적하며 총 광고수익을 순이익이라고 표현하지 않는다.

## 7.1 해외 광고경제 — v507

국가 + locale + landing family + device + source + consent state로 분리한다.

| 월 총수익 목표 | RPM 5,000원 | RPM 10,000원 | RPM 20,000원 |
|---:|---:|---:|---:|
| 100만 원 | 20만 PV | 10만 PV | 5만 PV |
| 500만 원 | 100만 PV | 50만 PV | 25만 PV |
| 1,000만 원 | 200만 PV | 100만 PV | 50만 PV |

이는 예측이 아니라 산술 시나리오다. 실제 Page RPM과 자격 자연검색 1,000세션당 수익을 사용한다. 증분 광고수익이 번역/콘텐츠/모더레이션/인프라/개인정보·컴플라이언스/지원비용을 넘고 retention/CWV/작업완료/invalid-traffic 정책 가드레일이 건강할 때 시장을 확대한다.

미국·일본·유럽의 큰 디지털광고 시장규모는 거시적 맥락일 뿐 Moneyverse publisher RPM을 보장하지 않는다.

## 7.2 Search Console 색인 회복 → 광고수익 선행게이트 — v512

2026-10-03 사용자 제공 관측 스냅샷은 Search Console 총 클릭 183, 색인됨 46, 색인 안 됨 103을 표시하고 최근 일 클릭이 약 0~2 수준까지 하락한 형태다. 같은 제공 자료의 AdSense 최근 7일은 페이지뷰 236(+17%), 노출 193(+10%), Page RPM US$0.26(-41%), 클릭 0, 페이지 CTR 0.00%, 예상수입 US$0.06을 표시한다. 이 값은 진단 트리거이며 장기 추세 또는 인과를 단독 증명하지 않는다.

광고수익 운영 순서는 다음과 같이 고정한다.

1. Search Console 제외사유를 URL 단위로 export하여 의도적 제외와 결함을 분리한다.
2. sitemap/robots/canonical/noindex/status/redirect/soft-404/내부링크/locale 충돌을 정리한다.
3. 검색 의도를 완결하는 고유 콘텐츠와 도구를 강화하고 orphan URL을 제거한다.
4. 7/28/90일로 qualified organic sessions, impressions, clicks, CTR, average position, index cohort, pageviews/session을 측정한다.
5. 그 뒤에만 광고 viewability/format/load 실험을 수행하며 Page RPM과 revenue/1,000 organic sessions를 함께 본다.

**금지:** 미색인 103개를 모두 강제 색인, 검색수요와 무관한 얇은 pSEO 대량생성, 광고 inventory 확보용 duplicate 페이지, 자체/유도 클릭, 광고 클릭을 KPI로 최적화하는 행위.

**운영 목표:** 올바르게 색인돼야 하는 URL의 결함률 감소와 자격 자연검색 세션 증가다. 로그인·계정·지갑·거래·관리자·비공개·민감 동의 화면 등 의도적 비색인은 성공적으로 제외된 상태로 간주한다. 광고수익 증가는 검색 품질·정책·CWV·사용자 작업완료를 훼손하지 않는 범위에서만 채택한다.

## 8. 사업자·세무 증거 게이트

국세청은 1인 미디어 안내에서 플랫폼 사업자에게 배분받는 광고수익을 수입 유형으로 안내하고, 일정 요건의 해외 플랫폼 용역대가에 대한 부가가치세 처리도 설명한다. 이 안내가 **이 웹사이트의 정확한 업종/과세 분류를 자동 결정하는 것은 아니다.**

광고 공급자 확대 또는 직접 광고계약 전 다음 증거를 유지한다.
- 현재 등록 사업활동;
- 실제 사업 개시일;
- 이 사업의 세무/부가가치세 처리 확인;
- 해외 플랫폼 지급내역;
- 개인정보/국외이전/vendor 기록;
- 적용 가능한 세금계산/영수/회계 증거.

## 9. 금지 트래픽/광고행위

하드 BLOCK:
- 운영자/게시자의 자체 live 광고 클릭;
- 지인/사용자에게 광고 클릭·새로고침 요청;
- paid-to-click, paid-to-surf, auto-surf, click-exchange;
- 봇/자동화로 광고 impression 생성;
- 내비게이션/다운로드/게임 control로 오인시키는 배치;
- 본문보다 광고/프로모션이 더 많은 페이지;
- 고단가 광고만을 노린 무관 키워드/콘텐츠 조작.

## 10. 근거

2026-09-30 직접 확인한 1차 자료:
- Google AdSense Page RPM: https://support.google.com/adsense/answer/112030
- Google Auto Ads: https://support.google.com/adsense/answer/9261805
- Google Auto Ads experiments: https://support.google.com/adsense/answer/9726342
- Google invalid traffic: https://support.google.com/adsense/answer/16737
- Google Publisher Policies/Restrictions: https://support.google.com/adsense/answer/10008391
- 국세청 1인 미디어 세무 안내: https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7802&mi=2480
- Mediavine requirements: https://www.mediavine.com/mediavine-requirements/

## 11. 릴리스 상태

이번 버전은 기획/문서만 변경한다. 새 AdSense 설정, 광고 실험, Test 배포, Production 배포, 세무분류 확정 또는 월 100만 원 달성을 주장하지 않는다.
